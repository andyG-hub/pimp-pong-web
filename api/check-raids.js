import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ error: "Please log in with X first!" });
  }

  const { tweetLink, walletAddress } = req.body;
  const userHandle = session.user.username.toLowerCase(); // Their real X handle

  // 1. REGEX to extract handle and tweet ID from the link
  // Matches x.com or twitter.com
  const tweetRegex = /(?:https?:\/\/)?(?:www\.)?(?:twitter|x)\.com\/([a-zA-Z0-9_]+)\/status\/(\d+)/;
  const match = tweetLink.match(tweetRegex);

  if (!match) {
    return res.status(400).json({ error: "Invalid X link format!" });
  }

  const handleInLink = match[1].toLowerCase();
  const tweetId = match[2];

  // 2. SECURITY CHECK: Is it their own link?
  if (handleInLink === "pimppong_pong") {
    return res.status(400).json({ error: "You cannot use the official post link! Quote tweet it and paste YOUR link." });
  }

  if (handleInLink !== userHandle) {
    return res.status(400).json({ error: `This link belongs to @${handleInLink}, but you are logged in as @${userHandle}.` });
  }

  // 3. DATABASE CHECK: Has this tweet already been claimed?
  const { data: existingRaid } = await supabase
    .from('raids')
    .select('id')
    .eq('tweet_id', tweetId)
    .single();

  if (existingRaid) {
    return res.status(400).json({ error: "This post has already been used to claim an egg!" });
  }

  // 4. SUCCESS: Give the egg and save the raid
  const { error: insertError } = await supabase
    .from('raids')
    .insert([{ 
      tweet_id: tweetId, 
      user_handle: userHandle, 
      wallet: walletAddress,
      created_at: new Date() 
    }]);

  if (insertError) return res.status(500).json({ error: "Database error. Try again." });

  return res.status(200).json({ message: "Egg claimed successfully! 🥚" });
}
