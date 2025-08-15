import { google } from 'googleapis';


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

export async function getCalendarEvents(accessToken: string, startDate: string, endDate: string) {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });

  const calendar = google.calendar({ version: 'v3', auth });
  const tasks = google.tasks({ version: 'v1', auth });

  try {
    const eventsResponse = await calendar.events.list({
      calendarId: 'primary',
      timeMin: new Date(startDate).toISOString(),
      timeMax: new Date(endDate).toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    });

    const calendarEvents = eventsResponse.data.items?.map((event: any) => ({
      id: event.id,
      time: event.start.dateTime,
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

    const tasksResponse = await tasks.tasks.list({
      tasklist: '@default',
      dueMin: new Date(startDate).toISOString(),
      dueMax: new Date(endDate).toISOString(),
      showCompleted: false,
    });

    const googleTasks = tasksResponse.data.items
      ?.filter((task: any) => task.due)
      .map((task: any) => ({
        id: task.id,
        time: task.due,
        title: task.title,
        type: 'Task',
        date: new Date(task.due).toISOString().slice(0, 10),
        description: task.notes || 'No description provided.',
        location: '',
        hangoutLink: '',
        attendees: [],
        source: 'tasks',
        dateTime: new Date(task.due),
      })) || [];

    return [...calendarEvents, ...googleTasks].sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime());
  } catch (error) {
    console.error("Error fetching calendar data:", error);
    throw new Error("Failed to fetch calendar data");
  }
}

export async function getEmails(accessToken: string) {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  const gmail = google.gmail({ version: 'v1', auth });

  try {
    const listResponse = await gmail.users.messages.list({
      userId: 'me',
      q: 'category:primary',
      maxResults: 10,
    });

    const messages = listResponse.data.messages;
    if (!messages || messages.length === 0) {
      return [];
    }

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
        const date = dateHeader ? new Date(dateHeader.value || 0) : new Date();
        const timeAgo = formatDistanceToNow(date, { addSuffix: true });

        let fullBody = '';
        const getBody = (payload: any): string => {
            if (!payload) return '';
            let htmlPart = payload.parts?.find((p: any) => p.mimeType === 'text/html');
            if (htmlPart && htmlPart.body?.data) return Buffer.from(htmlPart.body.data, 'base64').toString('utf-8');
            let textPart = payload.parts?.find((p: any) => p.mimeType === 'text/plain');
            if (textPart && textPart.body?.data) return Buffer.from(textPart.body.data, 'base64').toString('utf-8');
            if (payload.body?.data) return Buffer.from(payload.body.data, 'base64').toString('utf-8');
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

    return (await Promise.all(emailPromises)).filter(e => e !== null);
  } catch (error) {
    console.error("Error fetching emails:", error);
    throw new Error("Failed to fetch emails");
  }
}
