import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import { google } from 'googleapis';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { messageId } = await request.json();

  if (!messageId) {
    return NextResponse.json({ error: "Missing messageId" }, { status: 400 });
  }

  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: session.accessToken });

  const gmail = google.gmail({ version: 'v1', auth });

  try {
    await gmail.users.messages.modify({
      userId: 'me',
      id: messageId,
      requestBody: {
        addLabelIds: ['UNREAD'],
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error marking as unread:", error);
    return NextResponse.json({ error: "Failed to mark as unread", details: error.message }, { status: 500 });
  }
}
