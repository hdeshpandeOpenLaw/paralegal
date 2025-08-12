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

  const calendar = google.calendar({ version: 'v3', auth });
  const tasks = google.tasks({ version: 'v1', auth });

  const now = new Date();
  const timeMin = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0).toISOString();
  const timeMax = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7, 0, 0, 0, 0).toISOString();

  try {
    // Fetch Calendar Events
    const eventsResponse = await calendar.events.list({
      calendarId: 'primary',
      timeMin: timeMin,
      timeMax: timeMax,
      singleEvents: true,
      orderBy: 'startTime',
    });

    const calendarEvents = eventsResponse.data.items?.map((event: any) => ({
      id: event.id,
      time: event.start.dateTime, // Pass the full dateTime string
      title: event.summary,
      type: event.attendees ? "Meeting" : "Event",
      date: new Date(event.start.dateTime || event.start.date).toISOString().slice(0, 10),
      description: event.description || 'No description provided.',
      location: event.location || 'No location specified.',
      hangoutLink: event.hangoutLink,
      attendees: event.attendees?.map((att: any) => att.email) || [],
      source: 'calendar',
      dateTime: new Date(event.start.dateTime || event.start.date),
    })) || [];

    // Fetch Google Tasks
    const tasksResponse = await tasks.tasks.list({
      tasklist: '@default',
      dueMin: timeMin,
      dueMax: timeMax,
      showCompleted: false,
    });

    const googleTasks = tasksResponse.data.items
      ?.filter((task: any) => task.due) // Ensure task has a due date
      .map((task: any) => {
        return {
          id: task.id,
          time: task.due, // Pass the full due dateTime string
          title: task.title,
          type: 'Task',
          date: new Date(task.due).toISOString().slice(0, 10),
          description: task.notes || 'No description provided.',
          location: '',
          hangoutLink: '',
          attendees: [],
          source: 'tasks',
          dateTime: new Date(task.due),
        };
      }) || [];

    // Combine and sort
    const combinedList = [...calendarEvents, ...googleTasks].sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime());

    return NextResponse.json(combinedList);

  } catch (error: any) {
    console.error("Error fetching calendar data:", error);
    return NextResponse.json({ error: "Failed to fetch calendar data", details: error.message }, { status: 500 });
  }
}