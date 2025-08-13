import { useState, useRef, useEffect } from 'react';
import ChatModal from './ChatModal.jsx';

const SparklesIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.898 20.562L16.5 21.75l-.398-1.188a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.188-.398a2.25 2.25 0 001.423-1.423L16.5 15.75l.398 1.188a2.25 2.25 0 001.423 1.423L19.5 18.75l-1.188.398a2.25 2.25 0 00-1.423 1.423z" />
    </svg>
);

const suggestions = [
    "What are my upcoming meetings this week?",
    "Do I have a court appearance today?",
    "Catch me up with my unread emails",
];

const SearchBar = () => {
    const [query, setQuery] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [showChat, setShowChat] = useState(false);
    const searchContainerRef = useRef(null);

    const handleSearch = (currentQuery) => {
        if (currentQuery.trim()) {
            setQuery(currentQuery);
            setShowChat(true);
            setShowSuggestions(false);
        }
    };

    const handleInputChange = (e) => {
        const value = e.target.value;
        setQuery(value);
        setShowSuggestions(value.length > 0);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <div className="relative w-full max-w-4xl mx-auto" ref={searchContainerRef}>
            <div className="relative">
                <input
                    type="text"
                    placeholder="Ask any legal question..."
                    className="w-full py-4 pl-14 pr-4 text-lg bg-white border-2 border-blue-200 rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    value={query}
                    onChange={handleInputChange}
                    onFocus={() => setShowSuggestions(query.length > 0)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch(query)}
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-5 pointer-events-none">
                    <SparklesIcon className="h-6 w-6 text-blue-500" />
                </div>
            </div>

            {showSuggestions && (
                <div className="absolute top-full mt-2 w-full bg-white rounded-xl border border-gray-200 shadow-lg z-10">
                    <div className="p-3">
                        <h3 className="text-gray-400 text-xs font-semibold uppercase px-3 pt-2 pb-1">Recent Activities</h3>
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

            {showChat && <ChatModal query={query} onClose={() => setShowChat(false)} />}
        </div>
    );
};

export default SearchBar;
