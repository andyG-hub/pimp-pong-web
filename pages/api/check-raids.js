import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send();

  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: "Connect X account first!" });

  const { tweetLink } = req.body;
  const userHandle = session.user.username.toLowerCase();

  // Extract ID from link
  const match = tweetLink.match(/(?:twitter\.com|x\.com)\/([a-zA-Z0-9_]+)\/status\/(\d+)/i);
  if (!match) return res.status(400).json({ error: "Invalid link format!" });

  const handleInLink = match[1].toLowerCase();
  const tweetId = match[2];

  // Security Check 1: Must be user's own link
  if (handleInLink === "pimppong_pong") return res.status(400).json({ error: "Use YOUR quote tweet link, not ours!" });
  if (handleInLink !== userHandle) return res.status(400).json({ error: "This link belongs to someone else!" });

  // Security Check 2: Check used_ids table for duplicates
  const { data: alreadyUsed } = await supabase
    .from('used_ids')
    .select('*')
    .eq('tweet_id', tweetId) // Verify if your column name is 'tweet_id' or 'id'
    .single();

  if (alreadyUsed) return res.status(400).json({ error: "This egg has already been claimed!" });

  try {
    // 1. Mark ID as used
    await supabase.from('used_ids').insert([{ tweet_id: tweetId, user: userHandle }]);

    // 2. Add point to leaderboard
    const { data: user } = await supabase
      .from('gold_eggs_leaderboard')
      .select('points')
      .eq('twitter_name', userHandle) // Make sure this column name matches your table
      .single();

    const newPoints = (user?.points || 0) + 1;

    const { error: updateError } = await supabase
      .from('gold_eggs_leaderboard')
      .update({ points: newPoints })
      .eq('twitter_name', userHandle);

    if (updateError) throw updateError;

    return res.status(200).json({ success: true });

  } catch (err) {
    return res.status(500).json({ error: "Database error. Try again." });
  }
}
