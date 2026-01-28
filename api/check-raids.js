import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";
import { createClient } from "@supabase/supabase-js";

// 1. Initialize Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // 2. Get the Secure Session (This proves who the user actually is)
  const session = await getServerSession(req, res, authOptions);

  if (!session || !session.user || !session.user.username) {
    return res.status(401).json({ error: "Unauthorized. Please log in with X first!" });
  }

  const { tweetLink } = req.body;
  const loggedInHandle = session.user.username.toLowerCase();

  // 3. Extract Info from the Link
  // Example: https://x.com/RealUser123/status/1884260000000000000
  const tweetRegex = /(?:twitter\.com|x\.com)\/([a-zA-Z0-9_]+)\/status\/(\d+)/i;
  const match = tweetLink.match(tweetRegex);

  if (!match) {
    return res.status(400).json({ error: "Invalid X link. Please copy the full URL from your browser." });
  }

  const handleInLink = match[1].toLowerCase();
  const tweetId = match[2];

  // 4. SECURITY CHECK: No Official Links
  if (handleInLink === "pimppong_pong") {
    return res.status(400).json({ 
      error: "Nice try! You cannot use the official Pimp Pong link. You must Quote Tweet it and paste YOUR link." 
    });
  }

  // 5. SECURITY CHECK: Handle Mismatch (Anti-Cheating)
  if (handleInLink !== loggedInHandle) {
    return res.status(400).json({ 
      error: `Identity mismatch! You are logged in as @${loggedInHandle}, but you provided a link from @${handleInLink}.` 
    });
  }

  try {
    // 6. DATABASE CHECK: Is this specific Tweet ID already used?
    const { data: existingRaid, error: checkError } = await supabase
      .from('raids') // Make sure you have a table named 'raids'
      .select('tweet_id')
      .eq('tweet_id', tweetId)
      .single();

    if (existingRaid) {
      return res.status(400).json({ error: "This specific post has already been used to claim an egg!" });
    }

    // 7. SUCCESS: Save the raid and update the leaderboard
    // Record the raid so it can't be used again
    await supabase.from('raids').insert([{ 
        tweet_id: tweetId, 
        username: loggedInHandle, 
        created_at: new Date() 
    }]);

    // Add +1 Egg to the leaderboard
    const { error: updateError } = await supabase.rpc('increment_egg_points', { 
        target_twitter: loggedInHandle 
    });

    if (updateError) {
        // Fallback if you haven't set up the RPC function yet
        const { data: user } = await supabase
            .from('gold_eggs_leaderboard')
            .select('points')
            .eq('twitter_name', loggedInHandle)
            .single();

        await supabase
            .from('gold_eggs_leaderboard')
            .update({ points: (user?.points || 0) + 1 })
            .eq('twitter_name', loggedInHandle);
    }

    return res.status(200).json({ success: true, message: "Egg verified!" });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error." });
  }
}
