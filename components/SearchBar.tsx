import { useState, useRef, useEffect } from 'react';
import ChatHistory, { Message } from './ChatHistory';
import SparklesIcon from './SparklesIcon';

const suggestions = [
    "What are my upcoming meetings this week?",
    "Do I have a court appearance today?",
    "Catch me up with my unread emails",
];

const SearchBar = () => {
    const [query, setQuery] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [chatHistory, setChatHistory] = useState<Message[]>([]);
    const [isExpanded, setIsExpanded] = useState(false);
    const searchContainerRef = useRef<HTMLDivElement>(null);

    const handleSearch = async (currentQuery: string) => {
        if (!currentQuery.trim()) return;

        const userMessage: Message = { sender: 'user', text: currentQuery };
        const aiLoadingMessage: Message = { sender: 'ai', text: '', isLoading: true };

        const updatedHistory = [...chatHistory, userMessage];
        setChatHistory([...updatedHistory, aiLoadingMessage]);
        setShowSuggestions(false);
        setQuery('');
        setIsExpanded(true);

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    query: currentQuery,
                    history: updatedHistory.slice(-20)
                }),
            });
            const data = await res.json();
            const aiResponseMessage: Message = { sender: 'ai', text: data.response };
            setChatHistory(prev => [...prev.slice(0, -1), aiResponseMessage]);
        } catch (error) {
            const aiErrorMessage: Message = { sender: 'ai', text: 'Sorry, something went wrong.' };
            setChatHistory(prev => [...prev.slice(0, -1), aiErrorMessage]);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setQuery(value);
        setShowSuggestions(value.length > 0 && chatHistory.length === 0);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
                setIsExpanded(false);
                setChatHistory([]);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 w-full px-4 z-20 transition-all duration-500 ease-in-out ${isExpanded ? 'max-w-4xl' : 'max-w-xs'}`}>
            <div className={`relative w-full mx-auto transition-transform duration-700 ease-in-out ${!isExpanded ? 'hover:scale-105' : ''}`} ref={searchContainerRef}>
                {chatHistory.length > 0 && <ChatHistory messages={chatHistory} onClose={() => setChatHistory([])} />}
                <div className="relative">
                    <input
                        type="text"
                        placeholder="How can I help?"
                        className="w-full py-4 pl-14 pr-4 text-lg bg-white border-2 border-blue-200 rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                        value={query}
                        onChange={handleInputChange}
                        onFocus={() => {
                            setShowSuggestions(query.length > 0 && chatHistory.length === 0);
                            setIsExpanded(true);
                        }}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch(query)}
                    />
                    <div className="absolute inset-y-0 left-0 flex items-center pl-5 pointer-events-none">
                        <SparklesIcon className="h-6 w-6 text-blue-500" />
                    </div>
                </div>

                {showSuggestions && (
                    <div className="absolute bottom-full mb-2 w-full bg-white rounded-xl border border-gray-200 shadow-lg z-10">
                        <div className="p-3">
                            <h3 className="text-gray-400 text-xs font-semibold uppercase px-3 pt-2 pb-1">Suggestions</h3>
                            <ul className="mt-1">
                                {suggestions.map((suggestion, index) => (
                                    <li key={index} className="flex items-center py-2 px-3 rounded-lg hover:bg-blue-50 cursor-pointer"
                                        onClick={() => handleSearch(suggestion)}
                                    >
                                        <SparklesIcon className="h-5 w-5 text-slate-500" />
                                        <span className="ml-3 text-gray-700">{suggestion}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SearchBar;