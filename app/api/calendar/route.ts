import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { NextResponse } from "next/server"

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session || !session.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const now = new Date();
  const timeMin = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0).toISOString();
  const timeMax = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7, 0, 0, 0, 0).toISOString();


  const url = new URL("https://www.googleapis.com/calendar/v3/calendars/primary/events")
  url.searchParams.set("timeMin", timeMin)
  url.searchParams.set("timeMax", timeMax)
  url.searchParams.set("singleEvents", "true")
  url.searchParams.set("orderBy", "startTime")

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
    },
  })

  if (!res.ok) {
    const error = await res.json()
    console.error("Google Calendar API Error:", error)
    return NextResponse.json({ error: "Failed to fetch calendar events" }, { status: 500 })
  }

  const data = await res.json()

  const events = data.items.map((event: any) => ({
    time: new Date(event.start.dateTime || event.start.date).toLocaleTimeString(),
    title: event.summary,
    type: "Meeting",
    date: new Date(event.start.dateTime || event.start.date).toISOString().slice(0, 10),
  }));

  return NextResponse.json(events)
}