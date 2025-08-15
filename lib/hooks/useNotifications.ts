'use client';

import { useState, useEffect } from 'react';
import { getMatters, getTasks, getClioCalendarEvents } from '../clio-api';

export interface Notification {
  id: string;
  message: string;
  type: 'matter' | 'task' | 'calendar_event';
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      const token = localStorage.getItem('clio_access_token');
      let lastVisit = localStorage.getItem('lastVisitTimestamp');
      const now = new Date().toISOString();

      // If there's no last visit timestamp, set it to yesterday and fetch from there.
      if (!lastVisit) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        lastVisit = yesterday.toISOString();
        localStorage.setItem('lastVisitTimestamp', lastVisit);
      }

      if (token) {
        try {
          const newMattersPromise = getMatters(token, 100, 0, 'All', 'created_at(desc)', lastVisit);
          const newTasksPromise = getTasks(token, 100, 0, 'incomplete', 'id(desc)', '', lastVisit);
          const newEventsPromise = getClioCalendarEvents(token, lastVisit);

          const [mattersResult, tasksResult, eventsResult] = await Promise.all([newMattersPromise, newTasksPromise, newEventsPromise]);

          const matterNotifications = mattersResult.data.map((matter: any) => ({
            id: `matter-${matter.id}`,
            message: `New Matter: ${matter.display_number}`,
            type: 'matter' as 'matter',
          }));

          const taskNotifications = tasksResult.data.map((task: any) => ({
            id: `task-${task.id}`,
            message: `New Task: ${task.name}`,
            type: 'task' as 'task',
          }));

          const eventNotifications = eventsResult.data.map((event: any) => ({
            id: `event-${event.id}`,
            message: `New Calendar Event: ${event.summary}`,
            type: 'calendar_event' as 'calendar_event',
          }));

          const allNotifications = [...matterNotifications, ...taskNotifications, ...eventNotifications];
          
          setNotifications(allNotifications);
          setUnreadCount(allNotifications.length);

        } catch (error) {
          console.error("Failed to fetch notifications:", error);
        }
      }
      setLoading(false);
    };

    fetchNotifications();

    const handleBeforeUnload = () => {
      localStorage.setItem('lastVisitTimestamp', new Date().toISOString());
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  return { notifications, unreadCount, loading };
};