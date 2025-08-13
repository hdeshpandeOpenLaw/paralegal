'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import Header from "@/components/Header";
import SearchBar from "@/components/SearchBar.jsx";
import UpcomingEvents from "@/components/UpcomingEvents";
import ImportantInsights from "@/components/DocketUpdates";
import HowItWorks from "@/components/HowItWorks";
import PersonalDashboard from "@/components/PersonalDashboard";
import Login from '@/components/Login';

export default function Home() {
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

  const [activeView, setActiveView] = useState<'ai-assistant' | 'personal-dashboard'>('ai-assistant');

  const handleTabChange = (tab: 'ai-assistant' | 'personal-dashboard') => {
    setActiveView(tab);
  };

  if (!isReady) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="flex items-center">
          <img src="/loader.gif" alt="Loading..." className="w-8 h-8 mr-2" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  if (loginStep < 3) {
    return <Login currentStep={loginStep} />;
  }

  if (activeView === 'personal-dashboard') {
    return <PersonalDashboard onTabChange={handleTabChange} />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header activeTab="ai-assistant" onTabChange={handleTabChange} />
      <main className="max-w-7xl mx-auto px-8 pt-8 pb-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">Legal AI Assistant</h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">Get instant help with your legal questions and find relevant solutions</p>
        </div>
        
        <div className="mb-12">
          <SearchBar />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <UpcomingEvents />
          <ImportantInsights />
        </div>
        
        <HowItWorks />
      </main>
    </div>
  );
}