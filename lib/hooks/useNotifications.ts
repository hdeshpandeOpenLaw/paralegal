'use client';

import { useState, useEffect } from 'react';

export interface Notification {
  id: number;
  message: string;
  read: boolean;
}

// Mock data for notifications
const mockNotifications: Notification[] = [
  { id: 1, message: 'You have a new message from John Doe.', read: false },
  { id: 2, message: 'Your task "Review Contract" is due today.', read: false },
  { id: 3, message: 'A new document has been uploaded to the Smith case.', read: true },
];

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching notifications from an API
    const fetchNotifications = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
      setNotifications(mockNotifications);
      setUnreadCount(mockNotifications.filter(n => !n.read).length);
      setLoading(false);
    };

    fetchNotifications();
  }, []);

  const markAsRead = (id: number) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
    setUnreadCount(prev => (prev > 0 ? prev - 1 : 0));
  };

  return { notifications, unreadCount, loading, markAsRead };
};
