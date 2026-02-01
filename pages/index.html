<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pimp Pong | Gold Egg Leaderboard</title>
    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
    <style>
        body { font-family: 'Arial', sans-serif; background-color: #0b0b0b; color: white; text-align: center; padding: 20px; }
        .container { max-width: 500px; margin: auto; background: #1a1a1a; padding: 25px; border-radius: 20px; box-shadow: 0 0 20px rgba(255, 215, 0, 0.3); border: 1px solid #333; }
        h1 { color: #ffd700; text-shadow: 0 0 10px rgba(255, 215, 0, 0.5); font-size: 2.5em; margin-bottom: 5px; }
        .subtitle { color: #aaa; font-size: 0.9em; margin-bottom: 25px; }
        input { width: 90%; padding: 12px; margin: 10px 0; border-radius: 8px; border: 1px solid #444; background: #222; color: white; outline: none; }
        button { width: 95%; padding: 12px; border-radius: 8px; border: none; font-weight: bold; cursor: pointer; text-transform: uppercase; margin-top: 5px; font-size: 1em; transition: 0.3s; }
        .btn-reg { background: #ffd700; color: black; }
        .btn-raid { background: #1da1f2; color: white; }
        .btn-raid:disabled { background: #444; cursor: not-allowed; }
        #leaderboard { margin-top: 30px; text-align: left; background: #222; padding: 15px; border-radius: 12px; border: 1px solid #333; }
        .entry { display: flex; justify-content: space-between; align-items: center; padding: 12px; border-bottom: 1px solid #333; }
        .wallet-sub { font-size: 0.75em; color: #777; font-family: monospace; }
        .gold { color: #ffd700; font-weight: bold; }
        .raid-box { border-top: 1px solid #333; margin-top: 25px; padding-top: 20px; }
        .auth-status { margin-bottom: 15px; padding: 10px; border-radius: 8px; background: #222; border: 1px dashed #ffd700; }
    </style>
</head>
<body>

<div class="container">
    <h1>PIMP PONG 🏓</h1>
    <p class="subtitle">Join the movement & collect Gold Eggs!</p>

    <div id="auth-section" class="auth-status">
        <p style="font-size: 0.8em; color: #ffd700;">Step 1: Identity Verification</p>
        <button class="btn-raid" onclick="window.location.href='/api/auth/signin'">CONNECT X ACCOUNT</button>
    </div>

    <input type="hidden" id="twitterHandle"> <input type="text" id="walletAddress" placeholder="Your Solana Wallet Address">
    <button class="btn-reg" onclick="registerUser()">JOIN LEADERBOARD</button>

    <div class="raid-box">
        <h3 style="color: #ffd700; margin-bottom: 5px;">🥚 LIVE RAID</h3>
        <p style="font-size: 0.75em; color: #888; margin-bottom: 10px;">Paste YOUR quote tweet link to claim your egg:</p>
        <input type="text" id="tweetLink" placeholder="https://x.com/yourname/status/123...">
        <button class="btn-raid" id="raidBtn" onclick="submitRaid()">VERIFY & CLAIM EGG</button>
    </div>

    <div id="leaderboard">
        <h3 style="margin-top: 0; border-bottom: 1px solid #444; padding-bottom: 10px;">Leaderboard</h3>
        <div id="list">Checking security...</div>
    </div>
</div>

<script>
    const SUPABASE_URL = "https://advzccqwmbukvwdpnoef.supabase.co"; 
    const SUPABASE_ANON_KEY = "sb_publishable_B8rl0VLsTmd3GnQ-8RR9tA_smSIzz7s"; 
    const sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // 1. CHECK IF USER IS LOGGED IN ON LOAD
    async function checkUserSession() {
        try {
            const res = await fetch('/api/auth/session');
            const session = await res.json();

            if (session && session.user) {
                document.getElementById('auth-section').innerHTML = `
                    <p style="color: #1da1f2; font-weight: bold; margin: 0;">✅ Logged in as: @${session.user.username}</p>
                    <button onclick="window.location.href='/api/auth/signout'" style="background:none; border:none; color:gray; cursor:pointer; font-size:10px; text-decoration: underline;">(Logout)</button>
                `;
                document.getElementById('twitterHandle').value = session.user.username;
            }
        } catch (e) {
            console.log("Not logged in");
        }
    }

    // 2. FETCH LEADERBOARD DATA
    async function fetchLeaderboard() {
        const { data, error } = await sb.from('gold_eggs_leaderboard').select('*').order('points', { ascending: false });
        if (error) {
            document.getElementById('list').innerHTML = `<div style="color:red">Status: ${error.message}</div>`;
            return;
        }
        if (!data || data.length === 0) {
            document.getElementById('list').innerHTML = "<div style='text-align:center; color: #666;'>Leaderboard empty.</div>";
            return;
        }
        document.getElementById('list').innerHTML = data.map((u, i) => `
            <div class="entry">
                <div style="display:flex; flex-direction:column">
                    <span>${i + 1}. ${u.twitter_name}</span>
                    <span class="wallet-sub">${u.wallet_address.slice(0,4)}...${u.wallet_address.slice(-4)}</span>
                </div>
                <span class="gold">${u.points} 🥚</span>
            </div>
        `).join('');
    }

    // 3. REGISTER NEW USER
    async function registerUser() {
        const twitter_name = document.getElementById('twitterHandle').value.trim();
        const wallet_address = document.getElementById('walletAddress').value.trim();
        
        if (!twitter_name) return alert("Please Step 1: Connect your X account first!");
        if (!wallet_address) return alert("Please enter your Solana wallet!");

        const { error } = await sb.from('gold_eggs_leaderboard').insert([{ twitter_name, wallet_address, points: 0 }]);
        if (error) alert("You are already registered or there was an error: " + error.message); 
        else { alert("Registered!"); fetchLeaderboard(); }
    }

    // 4. SUBMIT RAID (NEW SECURE VERSION)
    async function submitRaid() {
        const twitterName = document.getElementById('twitterHandle').value.trim();
        const tweetLink = document.getElementById('tweetLink').value.trim();
        
        if (!twitterName) return alert("Please Connect X first!");
        if (!tweetLink) return alert("Paste your tweet link!");
        
        const btn = document.getElementById('raidBtn');
        btn.innerText = "Verifying...";
        btn.disabled = true;

        try {
            const response = await fetch('/api/check-raids', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ twitterName, tweetLink })
            });
            const result = await response.json();

            if (response.ok) { 
                alert("Gold Egg Claimed! 🥚"); 
                fetchLeaderboard(); 
                document.getElementById('tweetLink').value = ""; // Clear input
            } else { 
                alert(result.error); 
            }
        } catch (err) { 
            alert("System error. Make sure your Vercel project is deployed."); 
        } finally { 
            btn.innerText = "VERIFY & CLAIM EGG"; 
            btn.disabled = false; 
        }
    }

    // Initialize
    checkUserSession();
    fetchLeaderboard();
</script>
</body>
</html>
