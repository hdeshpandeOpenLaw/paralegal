'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Header from "@/components/Header";
import SearchBar from "@/components/SearchBar";
import PersonalDashboard from "@/components/PersonalDashboard";
import Login from '@/components/Login';

function HomeContent() {
  const { data: session, status } = useSession();
  const [loginStep, setLoginStep] = useState(1);
  const [isReady, setIsReady] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    // Don't do anything until the session is loaded
    if (status === 'loading') {
      setIsReady(false);
      return;
    }

    const clioToken = localStorage.getItem('clio_access_token');
    const clioAuthSuccess = searchParams.get('clioAuth') === 'success';

    if (status === 'authenticated') {
      if (clioToken || clioAuthSuccess) {
        setLoginStep(3);
      } else {
        setLoginStep(2);
      }
    } else { // status is 'unauthenticated'
      setLoginStep(1);
    }
    
    setIsReady(true);

  }, [status, searchParams]);

  const [activeView, setActiveView] = useState<'ai-assistant' | 'personal-dashboard'>('personal-dashboard');

  const handleTabChange = (tab: 'ai-assistant' | 'personal-dashboard') => {
    setActiveView(tab);
  };

  if (!isReady) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="flex items-center">
          <Image src="/loader.gif" alt="Loading..." width={32} height={32} className="mr-2" unoptimized />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  if (loginStep < 3) {
    return <Login currentStep={loginStep} />;
  }

  return (
    <>
      <div style={{ display: activeView === 'personal-dashboard' ? 'block' : 'none' }}>
        <PersonalDashboard onTabChange={handleTabChange} />
      </div>
      <div style={{ display: activeView === 'ai-assistant' ? 'block' : 'none' }}>
        <div className="min-h-screen bg-gray-100">
          <Header activeTab="ai-assistant" onTabChange={handleTabChange} />
          <main className="max-w-7xl mx-auto px-8 pt-8 pb-16">
          </main>
        </div>
      </div>
      <SearchBar />
    </>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}
