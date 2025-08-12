import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import Header from './Header';
import DynamicCalendar from './DynamicCalendar';


interface PersonalDashboardProps {
  onTabChange?: (tab: 'ai-assistant' | 'personal-dashboard') => void;
}

interface Email {
  id: string;
  sender: string;
  subject: string;
  snippet: string;
  fullBody: string;
  timeAgo: string;
  isUnread?: boolean;
  emailClient?: 'google';
}

const EmailModal = ({ email, onClose }: { email: Email | null, onClose: () => void }) => {
  const [replying, setReplying] = useState(false);
  const [forwarding, setForwarding] = useState(false);
  const [replyBody, setReplyBody] = useState("");
  const [forwardTo, setForwardTo] = useState("");
  const [forwardBody, setForwardBody] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  if (!email) return null;

  const handleReply = async () => {
    setIsSending(true);
    setSendError(null);
    try {
      const response = await fetch('/api/emails/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: email.sender,
          subject: `Re: ${email.subject}`,
          body: replyBody,
          originalMessageId: email.id,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || 'Failed to send reply.');
      }
      setReplying(false);
      setReplyBody("");
    } catch (error: any) {
      setSendError(error.message);
    } finally {
      setIsSending(false);
    }
  };

  const handleForward = async () => {
    setIsSending(true);
    setSendError(null);
    try {
      const response = await fetch('/api/emails/forward', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: forwardTo,
          subject: `Fwd: ${email.subject}`,
          body: `${forwardBody}<br><br>---------- Forwarded message ----------<br>From: ${email.sender}<br>Date: ${email.timeAgo}<br>Subject: ${email.subject}<br><br>${email.fullBody}`,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || 'Failed to forward email.');
      }
      setForwarding(false);
      setForwardTo("");
      setForwardBody("");
    } catch (error: any) {
      setSendError(error.message);
    } finally {
      setIsSending(false);
    }
  };

  const resetForms = () => {
    setReplying(false);
    setForwarding(false);
    setReplyBody("");
    setForwardTo("");
    setForwardBody("");
    setSendError(null);
  };

  const handleClose = () => {
    resetForms();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-full overflow-y-auto">
        <div className="p-8">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-2xl font-bold text-gray-900">{email.subject}</h2>
            <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex items-center mb-6 pb-6 border-b border-gray-200">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
              {email.sender.charAt(0)}
            </div>
            <div className="ml-4">
              <div className="font-semibold text-gray-800">{email.sender}</div>
              <div className="text-sm text-gray-500">to me</div>
            </div>
            <div className="ml-auto text-sm text-gray-500">{email.timeAgo}</div>
          </div>
          <div 
            className="text-gray-800 text-base leading-relaxed prose"
            dangerouslySetInnerHTML={{ __html: email.fullBody }}
          />
        </div>

        {(replying || forwarding) && (
          <div className="px-8 pb-8">
            <hr className="mb-6"/>
            {replying && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Reply to {email.sender}</h3>
                <textarea
                  value={replyBody}
                  onChange={(e) => setReplyBody(e.target.value)}
                  className="w-full h-32 p-2 border rounded-md"
                  placeholder="Write your reply..."
                />
                <div className="flex justify-end items-center mt-4">
                  {sendError && <p className="text-red-500 text-sm mr-4">{sendError}</p>}
                  <button onClick={() => setReplying(false)} className="px-4 py-2 text-sm font-medium text-gray-700">Cancel</button>
                  <button onClick={handleReply} disabled={isSending} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-blue-300">
                    {isSending ? 'Sending...' : 'Send Reply'}
                  </button>
                </div>
              </div>
            )}
            {forwarding && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Forward Email</h3>
                <input
                  type="email"
                  value={forwardTo}
                  onChange={(e) => setForwardTo(e.target.value)}
                  className="w-full p-2 border rounded-md mb-4"
                  placeholder="Forward to (email address)"
                />
                <textarea
                  value={forwardBody}
                  onChange={(e) => setForwardBody(e.target.value)}
                  className="w-full h-32 p-2 border rounded-md"
                  placeholder="Add a message..."
                />
                <div className="flex justify-end items-center mt-4">
                  {sendError && <p className="text-red-500 text-sm mr-4">{sendError}</p>}
                  <button onClick={() => setForwarding(false)} className="px-4 py-2 text-sm font-medium text-gray-700">Cancel</button>
                  <button onClick={handleForward} disabled={isSending} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-blue-300">
                    {isSending ? 'Sending...' : 'Forward'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {!replying && !forwarding && (
          <div className="bg-gray-50 px-8 py-4 flex justify-end space-x-3 rounded-b-2xl">
              <button onClick={() => { setReplying(true); setForwarding(false); }} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Reply</button>
              <button onClick={() => { setForwarding(true); setReplying(false); }} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700">Forward</button>
          </div>
        )}
      </div>
    </div>
  );
};

const KPICard = ({ title, value, color = "blue" }: { title: string, value: string, color?: string }) => (
  <div className="bg-white rounded-lg p-6 shadow-sm">
    <div className={`text-3xl font-bold text-${color}-600 mb-2`}>{value}</div>
    <div className="text-sm text-gray-600">{title}</div>
  </div>
);

const EmailItem = ({ email, onClick, onMarkUnread, onHide }: { 
  email: Email,
  onClick: () => void,
  onMarkUnread: (emailId: string) => void,
  onHide: (emailId: string) => void,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`rounded-lg p-4 shadow-sm mb-4 relative ${email.isUnread ? 'bg-blue-50' : 'bg-white'}`}>
      <div className="flex items-start justify-between">
        <div onClick={onClick} className="flex items-start space-x-3 flex-1 cursor-pointer">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mt-1 relative">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
            </svg>
            <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5">
              {email.emailClient === 'google' && (
                  <svg className="w-3 h-3" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                      <path d="M1 1h22v22H1z" fill="none" />
                  </svg>
              )}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-gray-900">{email.sender}</div>
            <div className="font-medium text-gray-800 text-sm">{email.subject}</div>
            <div className="text-gray-600 text-sm mt-1 line-clamp-2">{email.snippet}</div>
            <div className="text-gray-500 text-xs mt-2">{email.timeAgo}</div>
          </div>
        </div>
        <div className="relative" ref={menuRef}>
          <button onClick={() => setShowMenu(!showMenu)} className="text-gray-400 hover:text-gray-600 p-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </button>
          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
              {!email.isUnread && (
                <button onClick={() => { onMarkUnread(email.id); setShowMenu(false); }} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  Mark as unread
                </button>
              )}
              <button onClick={() => { onHide(email.id); setShowMenu(false); }} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                Hide
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const CalendarEvent = ({ time, title, type, icon }: { 
  time: string, 
  title: string, 
  type: string, 
  icon: React.ReactNode 
}) => (
  <div className="flex items-center space-x-2 mb-2">
    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
    <span className="text-xs text-gray-600">{time}</span>
    <span className="text-xs text-gray-800">{title}</span>
    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">{type}</span>
    {icon}
  </div>
);

const DonutChart = () => {
  const categories = [
    { name: 'Research', count: 6, color: 'bg-green-500' },
    { name: 'Calls', count: 16, color: 'bg-teal-500' },
    { name: 'Drafting', count: 24, color: 'bg-pink-500' },
    { name: 'Emails', count: 12, color: 'bg-purple-500' },
    { name: 'Files', count: 5, color: 'bg-orange-500' },
    { name: 'Meetings', count: 8, color: 'bg-amber-600' },
    { name: 'Review', count: 11, color: 'bg-red-500' },
  ];

  return (
    <div className="flex items-center space-x-8">
      {/* Donut Chart */}
      <div className="relative w-32 h-32">
        <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 32 32">
          <circle
            cx="16"
            cy="16"
            r="14"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="4"
          />
          {/* Chart segments - simplified representation */}
          <circle
            cx="16"
            cy="16"
            r="14"
            fill="none"
            stroke="#10b981"
            strokeWidth="4"
            strokeDasharray="44 100"
            strokeDashoffset="0"
          />
          <circle
            cx="16"
            cy="16"
            r="14"
            fill="none"
            stroke="#14b8a6"
            strokeWidth="4"
            strokeDasharray="44 100"
            strokeDashoffset="-44"
          />
          <circle
            cx="16"
            cy="16"
            r="14"
            fill="none"
            stroke="#ec4899"
            strokeWidth="4"
            strokeDasharray="44 100"
            strokeDashoffset="-88"
          />
          <circle
            cx="16"
            cy="16"
            r="14"
            fill="none"
            stroke="#8b5cf6"
            strokeWidth="4"
            strokeDasharray="44 100"
            strokeDashoffset="-132"
          />
          <circle
            cx="16"
            cy="16"
            r="14"
            fill="none"
            stroke="#f97316"
            strokeWidth="4"
            strokeDasharray="44 100"
            strokeDashoffset="-176"
          />
          <circle
            cx="16"
            cy="16"
            r="14"
            fill="none"
            stroke="#d97706"
            strokeWidth="4"
            strokeDasharray="44 100"
            strokeDashoffset="-220"
          />
          <circle
            cx="16"
            cy="16"
            r="14"
            fill="none"
            stroke="#ef4444"
            strokeWidth="4"
            strokeDasharray="44 100"
            strokeDashoffset="-264"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-800">82</div>
            <div className="text-xs text-gray-500">Total Tasks</div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="space-y-2">
        {categories.map((category, index) => (
          <div key={category.name} className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${category.color}`}></div>
            <span className="text-sm text-gray-700">{category.name}</span>
            <span className="text-sm font-medium text-gray-900">{category.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const TaskItem = ({ name, category, dateCreated }: { 
  name: string, 
  category: string, 
  dateCreated: string 
}) => {
  const getCategoryColor = (cat: string) => {
    const colors: { [key: string]: string } = {
      'Research': 'bg-green-100 text-green-700',
      'Calls': 'bg-teal-100 text-teal-700',
      'Drafting': 'bg-blue-100 text-blue-700',
      'Emails': 'bg-pink-100 text-pink-700',
      'Files': 'bg-purple-100 text-purple-700',
      'Meetings': 'bg-amber-100 text-amber-700',
      'Review': 'bg-red-100 text-red-700',
    };
    return colors[cat] || 'bg-gray-100 text-gray-700';
  };

  return (
    <tr className="border-b border-gray-100">
      <td className="py-3 px-4">
        <div className="font-medium text-gray-900">{name}</div>
      </td>
      <td className="py-3 px-4">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(category)}`}>
          {category}
        </span>
      </td>
      <td className="py-3 px-4 text-sm text-gray-600">{dateCreated}</td>
      <td className="py-3 px-4">
        <button className="text-gray-400 hover:text-gray-600">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        </button>
      </td>
    </tr>
  );
};

const PersonalDashboard = ({ onTabChange }: PersonalDashboardProps) => {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<'emails' | 'tasks'>('emails');
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [greeting, setGreeting] = useState('Morning');

  const [emails, setEmails] = useState<Email[]>([]);
  const [loadingEmails, setLoadingEmails] = useState(true);
  const [emailError, setEmailError] = useState<string | null>(null);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Morning');
    else if (hour < 18) setGreeting('Afternoon');
    else setGreeting('Evening');

    if (session) {
      setLoadingEmails(true);
      fetch('/api/emails')
        .then(res => {
          if (!res.ok) {
            throw new Error('Failed to fetch emails. Please ensure you have granted Gmail permissions.');
          }
          return res.json();
        })
        .then(data => {
          setEmails(data);
          setLoadingEmails(false);
        })
        .catch(err => {
          setEmailError(err.message);
          setLoadingEmails(false);
        });
    }
  }, [session]);

  const tasks = [
    { name: 'Special Sets', category: 'Research', dateCreated: '26 Jun, 2022' },
    { name: 'Order Of Dismissal', category: 'Drafting', dateCreated: '24 Jun, 2022' },
    { name: 'Client Call - Smith Case', category: 'Calls', dateCreated: '22 Jun, 2022' },
    { name: 'Notice Of Cancellation Of Hearing', category: 'Drafting', dateCreated: '21 Jun, 2022' },
    { name: 'Email Response - Contract Review', category: 'Emails', dateCreated: '21 Jun, 2022' },
    { name: 'Defendants Certificate Of Settlement Authori...', category: 'Files', dateCreated: '21 Jun, 2022' },
  ];

  const handleMarkUnread = async (emailId: string) => {
    // Optimistically update the UI
    setEmails(emails.map(e => e.id === emailId ? { ...e, isUnread: true } : e));

    await fetch('/api/emails/unread', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messageId: emailId }),
    });
  };

  const handleHide = async (emailId: string) => {
    // Optimistically remove the email from the list
    setEmails(emails.filter(e => e.id !== emailId));

    await fetch('/api/emails/archive', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messageId: emailId }),
    });
  };

  const handleCloseModal = () => {
    if (selectedEmail && selectedEmail.isUnread) {
      // Mark as read when closing the modal
      setEmails(emails.map(e => e.id === selectedEmail.id ? { ...e, isUnread: false } : e));
      fetch('/api/emails/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId: selectedEmail.id }),
      });
    }
    setSelectedEmail(null);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header activeTab="personal-dashboard" onTabChange={onTabChange} />
      <main className="max-w-7xl mx-auto px-8 pt-8 pb-16">
        {/* Greeting Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Good {greeting}, {session?.user?.name?.split(' ')[0]}! 👋</h1>
          <p className="text-gray-600">Here&apos;s what&apos;s happening with your legal work today</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <KPICard title="Unopened Matters" value="8" color="blue" />
          <KPICard title="Matters with pending balance" value="2" color="orange" />
          <KPICard title="Clients due for followup" value="4" color="green" />
          <KPICard title="Matters that need replenishing" value="25" color="red" />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Overview Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">Overview</h2>
                <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setActiveTab('emails')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeTab === 'emails'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    Emails
                  </button>
                  <button
                    onClick={() => setActiveTab('tasks')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeTab === 'tasks'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    Tasks
                  </button>
                </div>
              </div>

              {activeTab === 'emails' && (
                <div>
                  {loadingEmails && <p>Loading emails...</p>}
                  {emailError && <p className="text-red-500">{emailError}</p>}
                  {!loadingEmails && !emailError && emails.length === 0 && <p>No unread emails found.</p>}
                  {!loadingEmails && !emailError && emails.map((email, index) => (
                    <EmailItem
                      key={index}
                      email={email}
                      onClick={() => setSelectedEmail(email)}
                      onMarkUnread={handleMarkUnread}
                      onHide={handleHide}
                    />
                  ))}
                </div>
              )}

              {activeTab === 'tasks' && (
                <div>
                  <DonutChart />
                  
                  <div className="mt-8">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-800">Tasks</h3>
                    </div>
                    
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-3 px-4 font-medium text-gray-700">Task name</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-700">Category</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-700">Date created</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-700"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {tasks.map((task, index) => (
                            <TaskItem
                              key={index}
                              name={task.name}
                              category={task.category}
                              dateCreated={task.dateCreated}
                            />
                          ))}
                        </tbody>
                      </table>
                    </div>
                    
                    <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
                      <span>Showing 6 of 15 results</span>
                      <div className="flex items-center space-x-2">
                        <button className="p-1 hover:bg-gray-100 rounded">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>
                        <button className="px-2 py-1 bg-blue-600 text-white rounded text-xs">1</button>
                        <button className="px-2 py-1 hover:bg-gray-100 rounded text-xs">2</button>
                        <button className="px-2 py-1 hover:bg-gray-100 rounded text-xs">3</button>
                        <button className="p-1 hover:bg-gray-100 rounded">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          {/* Events Calendar */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Events calendar</h2>
            <DynamicCalendar />
          </div>

        </div>
      </main>
      {selectedEmail && <EmailModal email={selectedEmail} onClose={handleCloseModal} />}
    </div>
  );
};

export default PersonalDashboard;