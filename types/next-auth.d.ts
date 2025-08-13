import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    clioAccessToken?: string;
    clioRefreshToken?: string;
  }
}
