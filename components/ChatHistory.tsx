import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import Image from 'next/image';

export interface Message {
  sender: 'user' | 'ai';
  text: string;
  isLoading?: boolean;
}

interface ChatHistoryProps {
  messages: Message[];
  onClose: () => void;
}

const ChatHistory = ({ messages, onClose }: ChatHistoryProps) => {
  const [showScrollButton, setShowScrollButton] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleScroll = () => {
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
      // Show button if user has scrolled up more than 100px from the bottom
      if (scrollHeight - scrollTop > clientHeight + 100) {
        setShowScrollButton(true);
      } else {
        setShowScrollButton(false);
      }
    }
  };

  useEffect(() => {
    const container = chatContainerRef.current;
    container?.addEventListener('scroll', handleScroll);
    return () => container?.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="absolute bottom-full mb-2 w-full bg-white rounded-xl border border-gray-200 shadow-lg z-10 flex flex-col max-h-[400px]">
      {/* Header */}
      <div className="p-4 relative border-b border-gray-200">
        <button
          onClick={onClose}
          className="absolute top-1/2 right-4 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <div className="flex items-center px-3">
          <Image src="/ol-logo.svg" alt="Logo" width={90} height={19} />
          <span className="text-lg font-bold text-gray-800 ml-2">AI</span>
        </div>
      </div>
      
      {/* Messages */}
      <div className="overflow-y-auto p-4 flex-grow relative" ref={chatContainerRef}>
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div key={index} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`p-3 rounded-lg ${message.sender === 'user' ? 'max-w-lg bg-[rgb(0,140,255)] text-white' : 'w-5/6 text-gray-800'}`}
              >
                {message.isLoading ? (
                  <div className="flex items-center">
                    <Image src="/loader.gif" alt="Loading..." width={20} height={20} className="mr-2" />
                    <span>Thinking...</span>
                  </div>
                ) : (
                  <div className={`prose ${message.sender === 'ai' ? 'max-w-none' : ''} ${message.sender === 'user' ? 'prose-invert text-white' : ''}`}>
                    <ReactMarkdown>{message.text}</ReactMarkdown>
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>
      {showScrollButton && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-[rgb(0,140,255)] text-white rounded-full p-2 shadow-lg hover:bg-blue-600 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default ChatHistory;