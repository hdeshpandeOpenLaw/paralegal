import { useState, useEffect } from 'react';
import { useSession, signIn, signOut } from "next-auth/react";

const WEEK_DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

interface CalendarEventType {
  time: string;
  title: string;
  type: string;
  date: string; // ISO date string like '2025-08-11'
}

const DynamicCalendar = () => {
  const { data: session } = useSession();
  const [events, setEvents] = useState<CalendarEventType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (session) {
      setLoading(true);
      fetch('/api/calendar')
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
  }, [session]);

  const [currentMonday, setCurrentMonday] = useState(getMonday(new Date()));
  const [selectedDate, setSelectedDate] = useState(new Date());

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
    setCurrentMonday(prev => {
      const d = new Date(prev);
      d.setDate(prev.getDate() - 7);
      return d;
    });
    setSelectedDate(null as any);
  };

  const goNextWeek = () => {
    setCurrentMonday(prev => {
      const d = new Date(prev);
      d.setDate(prev.getDate() + 7);
      return d;
    });
    setSelectedDate(null as any);
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

      <div className="space-y-3 min-h-[100px]">
        {loading ? (
          <p>Loading events...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : eventsForSelectedDate.length > 0 ? (
          eventsForSelectedDate.map((event, idx) => (
            <div key={idx} className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-xs text-gray-600">{event.time}</span>
              <span className="text-xs text-gray-800">{event.title}</span>
              <span className="inline-flex items-center text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
              <svg className="w-3 h-3 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                <span className="ml-1.5">{event.type}</span>
              </span>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-sm italic">You have no events for this date.</p>
        )}
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
