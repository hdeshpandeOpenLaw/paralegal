import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

interface ChatModalProps {
  query: string;
  onClose: () => void;
}

const ChatModal = ({ query, onClose }: ChatModalProps) => {
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResponse = async () => {
      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query }),
        });
        const data = await res.json();
        setResponse(data.response);
      } catch (error) {
        setResponse('Sorry, something went wrong.');
      } finally {
        setLoading(false);
      }
    };

    fetchResponse();
  }, [query]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl">
        <div className="p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <h2 className="text-xl font-bold text-gray-900 mb-4">AI Assistant</h2>
          <p className="text-gray-700 mb-4">
            <strong>Your Question:</strong> {query}
          </p>
          <div className="bg-gray-100 p-4 rounded-lg prose">
            {loading ? (
              <p>Thinking...</p>
            ) : (
              <ReactMarkdown>{response}</ReactMarkdown>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatModal;