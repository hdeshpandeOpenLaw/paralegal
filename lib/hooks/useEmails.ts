'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Email } from '../../components/EmailModal';

export const useEmails = () => {
  const { data: session } = useSession();
  const [emails, setEmails] = useState<Email[]>([]);
  const [loadingEmails, setLoadingEmails] = useState(true);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);

  useEffect(() => {
    if (session) {
      setLoadingEmails(true);
      fetch('/api/emails')
        .then(res => {
          if (!res.ok) {
            throw new Error('Failed to fetch emails. Please ensure you have granted Gmail permissions.');
          }
          return res.json();
        })
        .then(data => {
          setEmails(data);
          setLoadingEmails(false);
        })
        .catch(err => {
          setEmailError(err.message);
          setLoadingEmails(false);
        });
    }
  }, [session]);

  const handleMarkUnread = async (emailId: string) => {
    setEmails(emails.map(e => e.id === emailId ? { ...e, isUnread: true } : e));
    await fetch('/api/emails/unread', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messageId: emailId }),
    });
  };

  const handleHide = async (emailId: string) => {
    setEmails(emails.filter(e => e.id !== emailId));
    await fetch('/api/emails/archive', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messageId: emailId }),
    });
  };

  const handleCloseModal = () => {
    if (selectedEmail && selectedEmail.isUnread) {
      setEmails(emails.map(e => e.id === selectedEmail.id ? { ...e, isUnread: false } : e));
      fetch('/api/emails/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId: selectedEmail.id }),
      });
    }
    setSelectedEmail(null);
  };

  return {
    emails,
    loadingEmails,
    emailError,
    selectedEmail,
    setSelectedEmail,
    handleMarkUnread,
    handleHide,
    handleCloseModal,
  };
};
