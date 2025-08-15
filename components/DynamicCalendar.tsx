import { useState, useEffect } from 'react';
import { useSession, signIn } from "next-auth/react";
import Image from 'next/image';
import EventSkeleton from './EventSkeleton';

const WEEK_DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

interface CalendarEventType {
  id: string;
  time: string;
  title: string;
  type: string;
  date: string;
  description: string;
  location?: string;
  hangoutLink?: string;
  attendees?: string[];
  source: 'calendar' | 'tasks';
}

const CalendarEventModal = ({ event, onClose }: { event: CalendarEventType | null, onClose: () => void }) => {
  if (!event) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-full overflow-y-auto">
        <div className="p-8">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-bold text-gray-900">{event.title}</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center text-sm text-gray-600">
              <svg className="w-5 h-5 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              <span>{new Date(event.date).toDateString()} at {event.time ? new Date(event.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'All day'}</span>
            </div>

            {event.location && (
              <div className="flex items-center text-sm text-gray-600">
                <svg className="w-5 h-5 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                <span>{event.location}</span>
              </div>
            )}

            {event.hangoutLink && (
              <div className="flex items-center text-sm">
                <svg className="w-5 h-5 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                <a href={event.hangoutLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  Join Google Meet
                </a>
              </div>
            )}
            
            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Description</h3>
              <div className="text-gray-700 text-sm prose max-w-none" dangerouslySetInnerHTML={{ __html: event.description }} />
            </div>

            {event.attendees && event.attendees.length > 0 && (
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Attendees ({event.attendees.length})</h3>
                <div className="flex flex-wrap gap-2">
                  {event.attendees.map((attendee, index) => (
                    <span key={index} className="bg-gray-100 text-gray-700 text-xs font-medium px-2.5 py-1 rounded-full">
                      {attendee}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const DynamicCalendar = () => {
  const { data: session } = useSession();
  const [events, setEvents] = useState<CalendarEventType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEventType | null>(null);
  const [currentMonday, setCurrentMonday] = useState(getMonday(new Date()));
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewedEvents, setViewedEvents] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('viewedEvents');
      if (saved) {
        return JSON.parse(saved);
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('viewedEvents', JSON.stringify(viewedEvents));
  }, [viewedEvents]);

  const handleEventClick = (event: CalendarEventType) => {
    setSelectedEvent(event);
    if (!viewedEvents.includes(event.id)) {
      setViewedEvents([...viewedEvents, event.id]);
    }
  };
  
  useEffect(() => {
    if (session) {
      setLoading(true);
      const startDate = toISODateString(currentMonday);
      const endDate = toISODateString(new Date(currentMonday.getTime() + 6 * 24 * 60 * 60 * 1000));
      const clioToken = localStorage.getItem('clio_access_token');
      
      const headers: HeadersInit = {};
      if (clioToken) {
        headers['X-Clio-Token'] = clioToken;
      }

      fetch(`/api/calendar?startDate=${startDate}&endDate=${endDate}`, { headers })
        .then((res) => {
          if (!res.ok) {
            throw new Error("Failed to fetch events");
          }
          return res.json();
        })
        .then((data) => {
          setEvents(data);
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message);
          setLoading(false);
        });
    }
  }, [session, currentMonday]);

  const weekDates = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(currentMonday);
    d.setDate(currentMonday.getDate() + i);
    return d;
  });

  const today = new Date();

  const monthYearLabel = currentMonday.toLocaleDateString('default', {
    month: 'long',
    year: 'numeric',
  });

  const goPrevWeek = () => {
    const newMonday = new Date(currentMonday);
    newMonday.setDate(currentMonday.getDate() - 7);
    setCurrentMonday(newMonday);
    setSelectedDate(newMonday);
  };

  const goNextWeek = () => {
    const newMonday = new Date(currentMonday);
    newMonday.setDate(currentMonday.getDate() + 7);
    setCurrentMonday(newMonday);
    setSelectedDate(newMonday);
  };

  const selectedISO = selectedDate ? toISODateString(selectedDate) : null;
  const eventsForSelectedDate = selectedISO
    ? events.filter(ev => ev.date === selectedISO)
    : [];

  if (!session) {
    return (
      <div>
        <p>Please sign in to see your calendar.</p>
        <button onClick={() => signIn('google')} className="p-2 bg-blue-500 text-white rounded">
          Sign in with Google
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <button onClick={goPrevWeek} className="p-1 hover:bg-gray-100 rounded" aria-label="Previous week">
          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="text-sm font-medium text-gray-700">{monthYearLabel}</span>
        <button onClick={goNextWeek} className="p-1 hover:bg-gray-100 rounded" aria-label="Next week">
          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1">
        {WEEK_DAYS.map(day => (
          <div key={day} className="text-xs text-gray-500 text-center font-semibold">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 mb-4">
        {weekDates.map((date, i) => {
          const isToday = isSameDate(date, today);
          const isSelected = selectedDate && isSameDate(date, selectedDate);
          return (
            <button
              key={date.toISOString()}
              onClick={() => setSelectedDate(date)}
              className={`
                text-sm text-center py-2 rounded-full
                ${isToday ? 'bg-blue-500 text-white font-semibold' : ''}
                ${!isToday && isSelected ? 'bg-gray-300 text-gray-900 font-semibold' : 'text-gray-800'}
                hover:bg-gray-200
                focus:outline-none
              `}
              title={date.toDateString()}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>

      <div className="space-y-3">
        {loading ? (
          <div>
            <EventSkeleton />
            <EventSkeleton />
            <EventSkeleton />
          </div>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : eventsForSelectedDate.length > 0 ? (
          eventsForSelectedDate.map((event, idx) => (
            <div key={idx} onClick={() => handleEventClick(event)} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-100 p-2 rounded-md">
              <div className={`w-2 h-2 ${!viewedEvents.includes(event.id) ? 'bg-blue-500' : 'bg-transparent'} rounded-full`}></div>
              <div className="w-4 h-4">
                {event.type === 'Task' && (
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                )}
                {event.type === 'Meeting' && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                )}
                {event.type === 'Court' && (
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h6m-6 4h6m-6 4h6"></path></svg>
                )}
                {event.type !== 'Task' && event.type !== 'Meeting' && event.type !== 'Court' && (
                    <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                )}
              </div>
              <span className="text-sm text-gray-600">{event.time ? new Date(event.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'All day'}</span>
              <span className="text-sm text-gray-800">{event.title}</span>
              {event.hangoutLink && (
                <a href={event.hangoutLink} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                </a>
              )}
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-sm italic">You have no events for this date.</p>
        )}
      </div>
      <CalendarEventModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
    </div>
  );
};

const AddEventModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const [summary, setSummary] = useState('');
  const [startAt, setStartAt] = useState('');
  const [endAt, setEndAt] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const clioToken = localStorage.getItem('clio_access_token');
    if (!clioToken) {
      setError('Clio token not found.');
      return;
    }

    try {
      const response = await fetch('/api/clio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: 'calendar_entries',
          method: 'POST',
          accessToken: clioToken,
          body: {
            data: {
              summary,
              start_at: new Date(startAt).toISOString(),
              end_at: new Date(endAt).toISOString(),
              description,
            }
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details?.error?.message || 'Failed to create event.');
      }

      setSuccess('Event created successfully!');
      setSummary('');
      setStartAt('');
      setEndAt('');
      setDescription('');
      setTimeout(() => {
        onClose();
        setSuccess(null);
      }, 2000);

    } catch (err: any) {
      setError(err.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="p-8">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Add New Calendar Event</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="summary" className="block text-sm font-medium text-gray-700">Summary</label>
              <input type="text" id="summary" value={summary} onChange={e => setSummary(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label htmlFor="startAt" className="block text-sm font-medium text-gray-700">Start Time</label>
              <input type="datetime-local" id="startAt" value={startAt} onChange={e => setStartAt(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label htmlFor="endAt" className="block text-sm font-medium text-gray-700">End Time</label>
              <input type="datetime-local" id="endAt" value={endAt} onChange={e => setEndAt(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
              <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} rows={4} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"></textarea>
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            {success && <p className="text-green-500 text-sm">{success}</p>}
            <div className="flex justify-end pt-4">
              <button type="button" onClick={onClose} className="mr-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">Cancel</button>
              <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">Create Event</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

function getMonday(date: Date) {
  const day = date.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + diff);
}

const isSameDate = (d1: Date, d2: Date) =>
  d1.getDate() === d2.getDate() &&
  d1.getMonth() === d2.getMonth() &&
  d1.getFullYear() === d2.getFullYear();

const toISODateString = (date: Date) => date.toISOString().slice(0, 10);

export default DynamicCalendar;
