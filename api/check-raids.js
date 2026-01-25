import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  // Wir erlauben nur POST Anfragen (Sicherheit)
  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { tweetLink, twitterName } = req.body;
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

  try {
    // 1. Link-Check
    if (!tweetLink || (!tweetLink.includes("x.com") && !tweetLink.includes("twitter.com"))) {
      return res.status(400).json({ error: "Please provide a valid X (Twitter) link." });
    }

    // 2. OEmbed Check (Kostenlose X-Abfrage)
    const xResponse = await fetch(`https://publish.twitter.com/oembed?url=${tweetLink}`);
    
    if (!xResponse.ok) {
      return res.status(400).json({ error: "Could not verify this Tweet. Is it private?" });
    }

    const xData = await xResponse.json();

    // 3. Namens-Check: Gehört der Tweet dem User? 
    const cleanName = twitterName.replace('@', '').toLowerCase();
    if (!xData.author_url.toLowerCase().includes(cleanName)) {
      return res.status(400).json({ error: "This Tweet doesn't match your X name!" });
    }

    // 4. Datenbank: Punkt vergeben
    const { error } = await supabase.rpc('claim_raid_point', { target_username: twitterName });
    
    if (error) throw error;

    return res.status(200).json({ success: true, message: "Vibe Check passed! Egg added." });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
