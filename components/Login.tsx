'use client';

import { signIn } from 'next-auth/react';
import Image from 'next/image';
import Stepper from './Stepper';

interface LoginProps {
  currentStep: number;
}

const Login: React.FC<LoginProps> = ({ currentStep }) => {

  const handleConnectClio = () => {
    const clientId = process.env.NEXT_PUBLIC_CLIO_CLIENT_ID;
    const redirectUri = process.env.NEXT_PUBLIC_CLIO_REDIRECT_URI;

    if (!clientId || !redirectUri) {
      console.error("Clio client ID or redirect URI is not configured properly in environment variables.");
      return;
    }

    const authUrl = `https://app.clio.com/oauth/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}`;
    window.location.href = authUrl;
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="w-full bg-white shadow-sm py-8">
        <Stepper currentStep={currentStep} />
      </div>
      
      <main className="flex-grow flex flex-col items-center justify-center text-center px-4">
        <div className="mb-10">
            <Image
                src="/ol-logo.svg"
                alt="Logo"
                width={180}
                height={38}
            />
        </div>
        
        {currentStep === 1 && (
            <>
              <h1 className="text-4xl font-bold mb-4 text-gray-800">Welcome to the Legal AI Assistant</h1>
              <p className="text-lg text-gray-600 mb-8 max-w-md">To get started, please sign in with your Google account.</p>
              <button
                onClick={() => signIn('google')}
                className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-semibold flex items-center justify-center hover:bg-gray-50 transition-colors shadow-sm mx-auto"
              >
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                </svg>
                Continue with Google
              </button>
            </>
        )}

        {currentStep === 2 && (
            <>
              <h1 className="text-3xl font-bold mb-4 text-gray-800">Almost there!</h1>
              <p className="text-lg text-gray-600 mb-8 max-w-md">Let&apos;s connect your Clio account before we get you into the app.</p>
              <button
                onClick={handleConnectClio}
                className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-semibold flex items-center justify-center hover:bg-gray-50 transition-colors shadow-sm mx-auto"
              >
                <Image
                  src="/clio.png"
                  alt="Clio Logo"
                  width={20}
                  height={20}
                  className="mr-3"
                />
                Connect Clio
              </button>
            </>
        )}
      </main>
    </div>
  );
};

export default Login;
