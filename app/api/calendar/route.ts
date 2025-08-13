import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextRequest, NextResponse } from "next/server";
import { getCalendarEvents } from "@/lib/google-api";
import { getClioCalendarEvents } from "@/lib/clio-api";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');
  const clioToken = req.headers.get('X-Clio-Token');

  if (!startDate || !endDate) {
    return NextResponse.json({ error: "startDate and endDate are required" }, { status: 400 });
  }

  try {
    let allEvents: any[] = [];

    // Fetch Google Calendar events if Google token is available
    if (session.accessToken) {
      try {
        const googleEvents = await getCalendarEvents(session.accessToken, startDate, endDate);
        allEvents = allEvents.concat(googleEvents);
      } catch (error) {
        console.error("Error fetching Google Calendar data:", error);
        // Decide if you want to fail the whole request or just log the error
      }
    }

    // Fetch Clio Calendar events if Clio token is available
    if (clioToken) {
      try {
        const clioResult = await getClioCalendarEvents(clioToken, startDate, endDate);
        const clioEvents = clioResult.data.map((event: any) => ({
          id: event.id,
          time: event.start_at,
          title: event.summary,
          type: event.calendar_entry_event_type?.name || null,
          date: new Date(event.start_at).toISOString().slice(0, 10),
          description: event.description || 'No description provided.',
          location: event.location || 'No location specified.',
          attendees: event.attendees?.map((att: any) => att.name) || [],
          source: 'calendar',
          dateTime: new Date(event.start_at),
        }));
        allEvents = allEvents.concat(clioEvents);
      } catch (error) {
        console.error("Error fetching Clio Calendar data:", error);
        // Decide if you want to fail the whole request or just log the error
      }
    }

    // Sort all events by date
    allEvents.sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime());

    return NextResponse.json(allEvents);
  } catch (error: any) {
    console.error("Error fetching calendar data:", error);
    return NextResponse.json({ error: "Failed to fetch calendar data", details: error.message }, { status: 500 });
  }
}