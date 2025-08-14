'use client';

import React from 'react';
import EmailSkeleton from './EmailSkeleton';
import EmailItem from './EmailItem';
import { Email } from './EmailModal';

interface EmailTabContentProps {
  loadingEmails: boolean;
  emailError: string | null;
  emails: Email[];
  currentEmails: Email[];
  emailsPerPage: number;
  currentPage: number;
  totalPages: number;
  setSelectedEmail: (email: Email) => void;
  handleMarkUnread: (emailId: string) => void;
  handleHide: (emailId: string) => void;
  paginate: (pageNumber: number) => void;
}

const EmailTabContent: React.FC<EmailTabContentProps> = ({
  loadingEmails,
  emailError,
  emails,
  currentEmails,
  emailsPerPage,
  currentPage,
  totalPages,
  setSelectedEmail,
  handleMarkUnread,
  handleHide,
  paginate,
}) => {
  if (loadingEmails) {
    return (
      <div>
        <EmailSkeleton />
        <EmailSkeleton />
        <EmailSkeleton />
        <EmailSkeleton />
        <EmailSkeleton />
      </div>
    );
  }

  if (emailError) {
    return <p className="text-red-500">{emailError}</p>;
  }

  if (emails.length === 0) {
    return <p>No unread emails found.</p>;
  }

  return (
    <>
      {currentEmails.map((email, index) => (
        <EmailItem
          key={index}
          email={email}
          onClick={() => setSelectedEmail(email)}
          onMarkUnread={handleMarkUnread}
          onHide={handleHide}
        />
      ))}
      {emails.length > emailsPerPage && (
        <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
          <span>
            Showing {currentPage * emailsPerPage - emailsPerPage + 1}-
            {Math.min(currentPage * emailsPerPage, emails.length)} of {emails.length} results
          </span>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-1 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-1 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default EmailTabContent;
