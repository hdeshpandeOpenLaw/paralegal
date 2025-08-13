import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getCalendarEvents, getEmails } from "@/lib/google-api";

export async function POST(req: NextRequest) {
  // 1. Check for Gemini API Key
  if (!process.env.GEMINI_API_KEY) {
    console.error("GEMINI_API_KEY is not set in .env.local");
    return NextResponse.json({ error: "Server configuration error: Missing Gemini API Key." }, { status: 500 });
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

  // 2. Check for user session
  const session = await getServerSession(authOptions);
  if (!session || !session.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 3. Get the query from the request
  const { query } = await req.json();
  if (!query) {
    return NextResponse.json({ error: "Query is required" }, { status: 400 });
  }

  // 4. Fetch data and generate response
  try {
    const today = new Date();
    const startDate = today.toISOString().split('T')[0];
    const endDate = new Date(new Date().setDate(today.getDate() + 7)).toISOString().split('T')[0];

    const [calendarEvents, emails] = await Promise.all([
      getCalendarEvents(session.accessToken, startDate, endDate),
      getEmails(session.accessToken),
    ]);

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      You are a paralegal and lawyer's personal assistant, also helping user with legal questions. Based on the following data, please answer the user's question.
      Use's name is: "${session?.user?.name?.split(' ')[0]}"
      User's Question: "${query}"

      Today's Date: ${new Date().toDateString()}

      Calendar Events (next 7 days):
      ${JSON.stringify(calendarEvents, null, 2)}

      Unread Emails:
      ${JSON.stringify(emails.filter(e => e.isUnread), null, 2)}

      Answer the question in a concise and friendly manner. Format your response using Markdown.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ response: text });
  } catch (error: any) {
    console.error("Error in chat API:", error);
    // Return a more specific error message
    return NextResponse.json({ error: "Failed to get response from AI.", details: error.message }, { status: 500 });
  }
}