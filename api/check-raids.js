import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: "Nur POST erlaubt" });

  const { tweetLink, twitterName } = req.body;
  
  // Verbindung zu deiner Supabase (Vercel nutzt deine Env-Variablen)
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

  try {
    // 1. Die ID aus dem Link ziehen (alles nach 'status/')
    const tweetId = tweetLink.split('status/')[1]?.split('?')[0]?.split('/')[0];
    
    if (!tweetId) {
      return res.status(400).json({ error: "Ungültiger Link! Bitte kopiere den direkten Link zum Tweet/Retweet." });
    }

    // 2. In der Tabelle 'used_ids' prüfen, ob diese ID schon existiert
    const { data: alreadyUsed, error: checkError } = await supabase
      .from('used_ids')
      .select('id_nummer')
      .eq('id_nummer', tweetId)
      .single();

    if (alreadyUsed) {
      return res.status(400).json({ error: "Dieser Raid-Link wurde bereits eingelöst!" });
    }

    // 3. ID als 'benutzt' markieren (in used_ids speichern)
    const { error: insertError } = await supabase
      .from('used_ids')
      .insert([{ id_nummer: tweetId, claimed_by: twitterName }]);

    if (insertError) throw insertError;

    // 4. Dem User den Punkt geben
    const { error: updateError } = await supabase.rpc('claim_raid_point', { target_username: twitterName });
    
    if (updateError) throw updateError;

    return res.status(200).json({ success: true, message: "Gold Egg erfolgreich gutgeschrieben!" });

  } catch (err) {
    console.error("Fehler:", err);
    return res.status(500).json({ error: "Datenbank-Fehler: " + err.message });
  }
}
