import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import { google } from 'googleapis';

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || !session.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: session.accessToken });

  const gmail = google.gmail({ version: 'v1', auth });

  try {
    // 1. Get the list of message IDs for the first 5 unread emails
    const listResponse = await gmail.users.messages.list({
      userId: 'me',
      q: 'is:unread',
      maxResults: 5,
    });

    const messages = listResponse.data.messages;
    if (!messages || messages.length === 0) {
      return NextResponse.json([]);
    }

    // 2. Fetch the full details for each message
    const emailPromises = messages.map(async (message) => {
      if (message.id) {
        const msgResponse = await gmail.users.messages.get({
          userId: 'me',
          id: message.id,
          format: 'full',
        });

        const { data } = msgResponse;
        const headers = data.payload?.headers;

        const fromHeader = headers?.find(h => h.name === 'From');
        const subjectHeader = headers?.find(h => h.name === 'Subject');
        const dateHeader = headers?.find(h => h.name === 'Date');

        const sender = fromHeader ? fromHeader.value || 'Unknown Sender' : 'Unknown Sender';
        const subject = subjectHeader ? subjectHeader.value || 'No Subject' : 'No Subject';
        const snippet = data.snippet || '';
        
        // Calculate time ago
        const date = dateHeader ? new Date(dateHeader.value || 0) : new Date();
        const timeAgo = formatDistanceToNow(date, { addSuffix: true });

        // Find the HTML or plain text body part
        let fullBody = '';
        const getBody = (payload: any) => {
            if (!payload) return '';
            
            // Prefer HTML body
            let htmlPart = payload.parts?.find((p: any) => p.mimeType === 'text/html');
            if (htmlPart && htmlPart.body?.data) {
                return Buffer.from(htmlPart.body.data, 'base64').toString('utf-8');
            }

            // Fallback to plain text
            let textPart = payload.parts?.find((p: any) => p.mimeType === 'text/plain');
            if (textPart && textPart.body?.data) {
                return Buffer.from(textPart.body.data, 'base64').toString('utf-8');
            }

            // Handle cases where body is directly in the payload (not multipart)
            if (payload.body?.data) {
                 return Buffer.from(payload.body.data, 'base64').toString('utf-8');
            }
            
            // Handle nested parts
            if(payload.parts) {
                for(const part of payload.parts) {
                    const nestedBody = getBody(part);
                    if(nestedBody) return nestedBody;
                }
            }

            return '';
        }

        fullBody = getBody(data.payload);


        return {
          id: data.id,
          sender,
          subject,
          snippet,
          fullBody,
          timeAgo,
          isUnread: data.labelIds?.includes('UNREAD'),
          emailClient: 'google',
        };
      }
      return null;
    });

    const emails = (await Promise.all(emailPromises)).filter(e => e !== null);
    return NextResponse.json(emails);

  } catch (error: any) {
    console.error("Error fetching emails:", error);
    return NextResponse.json({ error: "Failed to fetch emails", details: error.message }, { status: 500 });
  }
}

// Helper function to calculate relative time
function formatDistanceToNow(date: Date, options?: { addSuffix?: boolean }): string {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
}