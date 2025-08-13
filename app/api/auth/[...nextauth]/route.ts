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
    {
      id: "clio",
      name: "Clio",
      type: "oauth",
      version: "2.0",
      token: "https://app.clio.com/oauth/token",
      authorization: {
        url: "https://app.clio.com/oauth/authorize",
        params: { scope: "user:read calendar_entries:read" }
      },
      userinfo: "https://app.clio.com/api/v4/users/who_am_i",
      clientId: process.env.NEXT_PUBLIC_CLIO_CLIENT_ID,
      clientSecret: process.env.CLIO_CLIENT_SECRET,
      profile(profile) {
        return {
          id: profile.data.id,
          name: profile.data.name,
          email: profile.data.email,
        }
      },
    }
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account) {
        if (account.provider === 'google') {
          token.accessToken = account.access_token
        }
        if (account.provider === 'clio') {
          token.clioAccessToken = account.access_token;
          token.clioRefreshToken = account.refresh_token;
        }
      }
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