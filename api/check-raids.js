const { createClient } = require('@supabase/supabase-js');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: "Method not allowed" });

  const { tweetLink, twitterName } = req.body;
  const OFFICIAL_ACCOUNT = "PimpPong_PONG"; // Your official X handle
  
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

  try {
    // 1. SECURITY CHECK: Verify the link belongs to PimpPong_PONG
    // This prevents users from using links from other channels
    const isOfficialRaid = tweetLink.toLowerCase().includes(OFFICIAL_ACCOUNT.toLowerCase());
    
    if (!isOfficialRaid) {
        return res.status(400).json({ 
            error: `Invalid Raid! You must link a post from @${OFFICIAL_ACCOUNT}.` 
        });
    }

    // ID aus dem Link ziehen
    const tweetId = tweetLink.split('status/')[1]?.split('?')[0]?.split('/')[0];
    if (!tweetId) return res.status(400).json({ error: "Link ungültig!" });

    // 2. DUPLICATE CHECK: Prüfen, ob ID schon benutzt wurde
    const { data: alreadyUsed } = await supabase
      .from('used_ids')
      .select('id_nummer')
      .eq('id_nummer', tweetId)
      .single();

    if (alreadyUsed) return res.status(400).json({ error: "Dieser Link wurde schon eingelöst!" });

    // 3. ID speichern
    const { error: insertError } = await supabase
      .from('used_ids')
      .insert([{ id_nummer: tweetId, claimed_by: twitterName }]);

    if (insertError) throw insertError;

    // 4. Punkt geben
    // We use the rpc call to ensure the points are added correctly in the DB
    const { error: updateError } = await supabase.rpc('claim_raid_point', { target_username: twitterName });
    
    if (updateError) {
        // If the user isn't registered yet, rpc might fail or do nothing
        return res.status(400).json({ error: "User not found. Register for the leaderboard first!" });
    }

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error("Raid Error:", err.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
