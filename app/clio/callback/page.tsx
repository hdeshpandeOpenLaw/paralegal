'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import SuccessModal from '../../../components/SuccessModal';

const ClioCallbackContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const code = searchParams.get('code');
  
  const [message, setMessage] = useState('Authenticating with Clio...');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // useRef to prevent firing the fetch request twice in development (due to React Strict Mode)
  const requestSent = useRef(false);

  useEffect(() => {
    if (code && !requestSent.current) {
      requestSent.current = true;
      
      fetch(`/api/clio/token?code=${code}`)
        .then(async (res) => {
          if (res.ok) {
            return res.json();
          }
          const errorData = await res.json();
          throw new Error(errorData.details || 'Failed to exchange token');
        })
        .then((data) => {
          localStorage.setItem('clio_access_token', data.access_token);
          localStorage.setItem('clio_refresh_token', data.refresh_token);
          setMessage('Clio authentication successful!');
          setIsModalOpen(true);
        })
        .catch((error) => {
          console.error('Clio authentication error:', error);
          setError(error.message);
          setMessage(`Clio authentication failed: ${error.message}`);
        });
    }
  }, [code]);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    router.push('/?clioAuth=success');
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <p className="text-lg">{message}</p>
        {error && <p className="text-red-500 mt-2">Please try connecting to Clio again from the dashboard.</p>}
      </div>
      <SuccessModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        message="Your Clio account is now securely linked. You're all set!"
      />
    </div>
  );
};

const ClioCallback = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <ClioCallbackContent />
  </Suspense>
);

export default ClioCallback;
