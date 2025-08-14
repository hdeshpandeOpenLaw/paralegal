'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Email } from './EmailModal';

const EmailItem = ({ email, onClick, onMarkUnread, onHide }: { 
  email: Email,
  onClick: () => void,
  onMarkUnread: (emailId: string) => void,
  onHide: (emailId: string) => void,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`rounded-lg p-4 shadow-sm mb-4 relative ${email.isUnread ? 'bg-blue-50' : 'bg-white'}`}>
      <div className="flex items-start justify-between">
        <div onClick={onClick} className="flex items-start space-x-3 flex-1 cursor-pointer">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mt-1 relative">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2.003 5.884L10 9.882l7-997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
            </svg>
            <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5">
              {email.emailClient === 'google' && (
                  <svg className="w-3 h-3" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                      <path d="M1 1h22v22H1z" fill="none" />
                  </svg>
              )}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-gray-900">{email.sender}</div>
            <div className="font-medium text-gray-800 text-sm">{email.subject}</div>
            <div className="text-gray-600 text-sm mt-1 line-clamp-2">{email.snippet}</div>
            <div className="text-gray-500 text-xs mt-2">{email.timeAgo}</div>
          </div>
        </div>
        <div className="relative" ref={menuRef}>
          <button onClick={() => setShowMenu(!showMenu)} className="text-gray-400 hover:text-gray-600 p-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </button>
          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
              {!email.isUnread && (
                <button onClick={() => { onMarkUnread(email.id); setShowMenu(false); }} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  Mark as unread
                </button>
              )}
              <button onClick={() => { onHide(email.id); setShowMenu(false); }} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                Hide
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailItem;
