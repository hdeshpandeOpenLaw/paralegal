import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import { getEmails } from "@/lib/google-api";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || !session.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const emails = await getEmails(session.accessToken);
    return NextResponse.json(emails);
  } catch (error: any) {
    console.error("Error fetching emails:", error);
    return NextResponse.json({ error: "Failed to fetch emails", details: error.message }, { status: 500 });
  }
}