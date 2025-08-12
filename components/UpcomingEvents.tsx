import { useState } from 'react';

interface EventData {
    date: string;
    day: string;
    title: string;
    type: string;
    time: string;
    duration: string;
    icon: React.ReactNode;
    description: string;
    location?: string;
    attendees?: string[];
}

const EventModal = ({ event, onClose }: { event: EventData | null, onClose: () => void }) => {
  if (!event) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
        <div className="p-8">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center">
                <div className="mr-4 text-gray-500 [&>svg]:w-8 [&>svg]:h-8">
                    {event.icon}
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">{event.title}</h2>
                    <p className="text-sm text-gray-500 flex items-center mt-1">
                        <span className="font-semibold text-gray-700">{event.type}</span>
                    </p>
                </div>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          
          <div className="space-y-4 text-gray-700">
            <div>
                <p className="font-semibold">Date & Time</p>
                <p>{event.day} {event.date}, {event.time} - {event.duration}</p>
            </div>
            {event.location && 
                <div>
                    <p className="font-semibold">Location</p>
                    <p>{event.location}</p>
                </div>
            }
            <div>
                <p className="font-semibold">Details</p>
                <p>{event.description}</p>
            </div>
            {event.attendees && event.attendees.length > 0 && (
                <div>
                    <h3 className="font-semibold">Attendees</h3>
                    <ul className="list-disc list-inside text-gray-600">
                        {event.attendees.map(attendee => <li key={attendee}>{attendee}</li>)}
                    </ul>
                </div>
            )}
          </div>
        </div>
        <div className="bg-gray-50 px-8 py-4 flex justify-end space-x-3 rounded-b-2xl">
            <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Edit</button>
            <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700">Join Meeting</button>
        </div>
      </div>
    </div>
  );
};

const Event = ({ event, onClick }: { event: EventData, onClick: () => void }) => (
    <div onClick={onClick} className="flex items-center justify-between p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors">
        <div className="flex items-center">
            <div className="text-center mr-4">
                <p className="text-2xl font-bold text-gray-800">{event.date}</p>
                <p className="text-sm text-gray-500">{event.day}</p>
            </div>
            <div>
                <p className="font-semibold text-gray-800">{event.title}</p>
                <p className="text-sm text-gray-500 flex items-center">
                    {event.icon}
                    <span className="ml-1">{event.type}</span>
                </p>
            </div>
        </div>
        <div className="text-right">
            <p className="text-sm text-gray-800">{event.time}</p>
            <p className="text-sm text-gray-500">{event.duration}</p>
        </div>
    </div>
);

const UpcomingEvents = () => {
    const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null);

    const events: EventData[] = [
        {
            date: "24",
            day: "MAR",
            title: "Client Meeting - Smith Case",
            type: "Meeting",
            time: "10:00 AM",
            duration: "11:30 AM",
            icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>,
            description: "Discuss settlement strategy and prepare for upcoming deposition with John Smith.",
            location: "Conference Room 3",
            attendees: ["Andrew Williams", "John Smith", "Sarah (Paralegal)"]
        },
        {
            date: "25",
            day: "MAR",
            title: "Court Hearing - Johnson vs. C...",
            type: "Court",
            time: "10:00 AM",
            duration: "11:30 AM",
            icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>,
            description: "Motion to compel hearing in Johnson vs. Creative Solutions Inc.",
            location: "Courthouse, Room 201",
            attendees: ["Andrew Williams", "Opposing Counsel"]
        },
        {
            date: "26",
            day: "MAR",
            title: "Deposition - Williams Case...",
            type: "Deposition",
            time: "10:00 AM",
            duration: "11:30 AM",
            icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>,
            description: "Deposition of our client, Mr. Williams, in the ongoing personal injury case.",
            location: "Our Office - Main Conference Room",
            attendees: ["Andrew Williams", "Mr. Williams", "Opposing Counsel", "Court Reporter"]
        },
        {
            date: "27",
            day: "MAR",
            title: "Contract Review Meeting",
            type: "Meeting",
            time: "10:00 AM",
            duration: "11:30 AM",
            icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>,
            description: "Internal meeting to review the new software licensing agreement.",
            location: "Virtual (Zoom)",
            attendees: ["Andrew Williams", "Legal Team"]
        }
    ];

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-2 text-gray-800">Upcoming Events</h2>
            <p className="text-gray-500 mb-4">Your scheduled meetings and court appearances</p>
            {events.map((event, index) => (
                <Event key={index} event={event} onClick={() => setSelectedEvent(event)} />
            ))}
            {selectedEvent && <EventModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />} 
        </div>
    );
}

export default UpcomingEvents;