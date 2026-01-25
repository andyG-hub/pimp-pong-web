const { createClient } = require('@supabase/supabase-js');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: "Method not allowed" });

  const { tweetLink, twitterName } = req.body;
  
  // Nutzt deine in Vercel hinterlegten Environment Variables
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

  try {
    // ID aus dem Link ziehen
    const tweetId = tweetLink.split('status/')[1]?.split('?')[0]?.split('/')[0];
    if (!tweetId) return res.status(400).json({ error: "Link ungültig!" });

    // 1. Prüfen, ob ID schon benutzt wurde
    const { data: alreadyUsed } = await supabase
      .from('used_ids')
      .select('id_nummer')
      .eq('id_nummer', tweetId)
      .single();

    if (alreadyUsed) return res.status(400).json({ error: "Dieser Link wurde schon eingelöst!" });

    // 2. ID speichern
    const { error: insertError } = await supabase
      .from('used_ids')
      .insert([{ id_nummer: tweetId, claimed_by: twitterName }]);

    if (insertError) throw insertError;

    // 3. Punkt geben
    const { error: updateError } = await supabase.rpc('claim_raid_point', { target_username: twitterName });
    if (updateError) throw updateError;

    return res.status(200).json({ success: true });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
