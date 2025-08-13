import {
  getServerSession
} from "next-auth/next";
import {
  authOptions
} from "@/app/api/auth/[...nextauth]/route";
import {
  NextResponse
} from "next/server";
import {
  google
} from 'googleapis';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { to, subject, body, originalMessageId } = await request.json();

  if (!to || !subject || !body || !originalMessageId) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: session.accessToken });

  const gmail = google.gmail({ version: 'v1', auth });

  try {
    const originalMessage = await gmail.users.messages.get({
        userId: 'me',
        id: originalMessageId,
        format: 'metadata',
        metadataHeaders: ['Message-ID', 'References', 'In-Reply-To']
    });

    const originalHeaders = originalMessage.data.payload?.headers;
    const originalMessageIdHeader = originalHeaders?.find(h => h.name === 'Message-ID')?.value;
    const referencesHeader = originalHeaders?.find(h => h.name === 'References')?.value;

    const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=";
    const messageParts = [
      `To: ${to}`,
      `Subject: ${utf8Subject}`,
      "MIME-Version: 1.0",
      "Content-Type: text/html; charset=utf-8",
      `In-Reply-To: ${originalMessageIdHeader}`,
      `References: ${referencesHeader ? referencesHeader + ' ' : ''}${originalMessageIdHeader}`,
      "",
      body,
    ];
    const message = messageParts.join("\n");

    const raw = Buffer.from(message).toString("base64").replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

    await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: raw,
        threadId: originalMessage.data.threadId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error sending reply:", error);
    return NextResponse.json({ error: "Failed to send reply", details: error.message }, { status: 500 });
  }
}