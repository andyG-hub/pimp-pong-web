import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]"; // This line was causing the error
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send();

  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: "Connect X account first!" });

  const { tweetLink } = req.body;
  const userHandle = session.user.username.toLowerCase();

  const match = tweetLink.match(/(?:twitter\.com|x\.com)\/([a-zA-Z0-9_]+)\/status\/(\d+)/i);
  if (!match) return res.status(400).json({ error: "Invalid link format!" });

  const handleInLink = match[1].toLowerCase();
  const tweetId = match[2];

  if (handleInLink === "pimppong_pong") return res.status(400).json({ error: "Use YOUR quote tweet link!" });
  if (handleInLink !== userHandle) return res.status(400).json({ error: "This link belongs to someone else!" });

  const { data: alreadyUsed } = await supabase
    .from('used_ids')
    .select('*')
    .eq('tweet_id', tweetId)
    .single();

  if (alreadyUsed) return res.status(400).json({ error: "This egg has already been claimed!" });

  try {
    await supabase.from('used_ids').insert([{ tweet_id: tweetId, user: userHandle }]);

    const { data: user } = await supabase
      .from('gold_eggs_leaderboard')
      .select('points')
      .eq('twitter_name', userHandle)
      .single();

    const newPoints = (user?.points || 0) + 1;

    await supabase
      .from('gold_eggs_leaderboard')
      .update({ points: newPoints })
      .eq('twitter_name', userHandle);

    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: "Database error." });
  }
}
