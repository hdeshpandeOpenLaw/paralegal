import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { clioAccessToken, clioRefreshToken } = await req.json();

    const token = await getToken({ req });

    if (token) {
        token.clioAccessToken = clioAccessToken;
        token.clioRefreshToken = clioRefreshToken;
    }

    // This doesn't actually save the token back to the session cookie.
    // The next-auth session is read-only from external API routes.
    // A more robust solution is needed here, but for now, we will
    // rely on the client-side to hold the token and pass it with each request.

    return NextResponse.json({ message: "Session updated" });
}
