import NextAuth from "next-auth";
import TwitterProvider from "next-auth/providers/twitter";

export default NextAuth({
  providers: [
    TwitterProvider({
      clientId: process.env.TWITTER_CLIENT_ID,
      clientSecret: process.env.TWITTER_CLIENT_SECRET,
      version: "2.0", // This is very important for X OAuth 2.0
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      // This part ensures the bot knows the user's handle (@name)
      session.user.username = token.screen_name || token.name; 
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
});
