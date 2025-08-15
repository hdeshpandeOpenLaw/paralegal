'use client';

import Image from 'next/image';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useState, useEffect, useRef } from 'react';
import { useNotifications } from '../lib/hooks/useNotifications';

interface HeaderProps {
  activeTab?: 'ai-assistant' | 'personal-dashboard';
  onTabChange?: (tab: 'ai-assistant' | 'personal-dashboard') => void;
}

const Header = ({ activeTab = 'personal-dashboard', onTabChange }: HeaderProps) => {
  const { data: session } = useSession();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const { notifications, unreadCount, loading } = useNotifications();

  const handleSignOut = () => {
    localStorage.removeItem('clio_access_token');
    localStorage.removeItem('clio_refresh_token');
    signOut({ callbackUrl: '/' });
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="flex justify-between items-center px-8 py-6">
      <div className="flex items-center">
        <Image src="/ol-logo.svg" alt="OpenLaw Logo" width={180} height={38} priority />
      </div>
      <div className="flex items-center bg-gray-200 rounded-full p-1 shadow-sm">
        <button 
          onClick={() => onTabChange?.('personal-dashboard')}
          className={`py-2.5 px-6 rounded-full font-medium text-sm transition-all duration-200 ${
            activeTab === 'personal-dashboard'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Personal Dashboard
        </button>
        <button 
          onClick={() => onTabChange?.('ai-assistant')}
          className={`py-2.5 px-6 rounded-full font-medium text-sm transition-all duration-200 ${
            activeTab === 'ai-assistant'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Firm Dashboard
        </button>
      </div>
      <div className="flex items-center">
        {session ? (
          <div className="flex items-center space-x-4">
            <div className="relative" ref={notificationsRef}>
              <svg 
                onClick={() => setShowNotifications(!showNotifications)}
                className="w-6 h-6 text-gray-600 cursor-pointer transition-transform duration-200 ease-in-out hover:scale-110" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                ></path>
              </svg>
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 block h-4 w-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg py-2 z-50">
                  <div className="px-4 py-2 text-sm text-gray-700 font-bold flex justify-between items-center">
                    <span>Notifications</span>
                    {unreadCount > 0 && (
                      <button 
                        onClick={() => {
                          localStorage.setItem('lastVisitTimestamp', new Date().toISOString());
                          window.location.reload(); // Reload to clear notifications
                        }}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>
                  <div className="border-t border-gray-200"></div>
                  {loading ? (
                    <div className="px-4 py-3 text-sm text-gray-600">Loading...</div>
                  ) : notifications.length > 0 ? (
                    notifications.map(notification => (
                      <div 
                        key={notification.id} 
                        className="px-4 py-3 text-sm text-gray-800 border-b border-gray-100"
                      >
                        {notification.message}
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-sm text-gray-600">No new notifications.</div>
                  )}
                </div>
              )}
            </div>
            <div className="relative" ref={dropdownRef}>
              <Image
                src={session.user?.image || '/fallback-avatar.png'}
                alt={session.user?.name || 'User'}
                width={40}
                height={40}
                className="rounded-full cursor-pointer"
                onClick={() => setShowDropdown(!showDropdown)}
              />
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                  <button
                    onClick={handleSignOut}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <button
            onClick={() => signIn('google')}
            className="text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-full"
          >
            Sign in
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;