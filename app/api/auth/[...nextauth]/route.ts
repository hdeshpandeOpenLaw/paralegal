import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"

export const authOptions = {
  // Configure one or more authentication providers
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      authorization: {
        params: {
          scope: "openid email profile https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.modify https://www.googleapis.com/auth/tasks.readonly",
          prompt: "select_account",
        },
      },
    }),
    // ...add more providers here
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token
      }
      // This is a placeholder for where you would add the Clio token
      // after the Clio OAuth flow. You'll need a custom mechanism to trigger
      // an update to the session.
      return token
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string;
      session.clioAccessToken = token.clioAccessToken as string;
      session.clioRefreshToken = token.clioRefreshToken as string;
      return session
    },
  },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }