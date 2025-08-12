'use client';

import Image from 'next/image';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useState, useEffect, useRef } from 'react';

interface HeaderProps {
  activeTab?: 'ai-assistant' | 'personal-dashboard';
  onTabChange?: (tab: 'ai-assistant' | 'personal-dashboard') => void;
}

const Header = ({ activeTab = 'ai-assistant', onTabChange }: HeaderProps) => {
  const { data: session } = useSession();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
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
        <Image src="/ol-logo.svg" alt="OpenLaw Logo" width={150} height={32} priority />
      </div>
      <div className="flex items-center bg-gray-200 rounded-full p-1 shadow-sm">
        <button 
          onClick={() => onTabChange?.('ai-assistant')}
          className={`py-2.5 px-6 rounded-full font-medium text-sm transition-all duration-200 ${
            activeTab === 'ai-assistant'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          AI Assistant
        </button>
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
      </div>
      <div className="flex items-center">
        {session ? (
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
                  onClick={() => signOut()}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Sign Out
                </button>
              </div>
            )}
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
