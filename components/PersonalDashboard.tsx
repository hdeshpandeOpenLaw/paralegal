import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import Header from './Header';
import DynamicCalendar from './DynamicCalendar';
import MatterModal from './MatterModal';
import EmailModal from './EmailModal';
import TaskModal from './TaskModal';
import KPICard from './KPICard';
import { useClioData } from '../lib/hooks/useClioData';
import { useEmails } from '../lib/hooks/useEmails';
import EmailTabContent from './EmailTabContent';
import TaskTabContent from './TaskTabContent';
import MatterTabContent from './MatterTabContent';

interface PersonalDashboardProps {
  onTabChange?: (tab: 'ai-assistant' | 'personal-dashboard') => void;
}

const PersonalDashboard = ({ onTabChange }: PersonalDashboardProps) => {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<'emails' | 'tasks' | 'matters'>('emails');
  const [greeting, setGreeting] = useState('Morning');
  const [currentPage, setCurrentPage] = useState(1);
  const emailsPerPage = 5;

  const [isClioConnected, setIsClioConnected] = useState(false);
  const [matterFilter, setMatterFilter] = useState('All');
  const [sortOption, setSortOption] = useState('id(asc)');
  const [taskFilter, setTaskFilter] = useState('All');
  const [taskPriorityFilter, setTaskPriorityFilter] = useState('All');
  const [taskSortOption, setTaskSortOption] = useState('due_at(asc)');
  const [taskTypeFilter, setTaskTypeFilter] = useState('');
  const searchParams = useSearchParams();

  const {
    clioMatters,
    loadingClio,
    clioError,
    pendingMattersCount,
    billsAwaitingPaymentCount,
    clientsDueForFollowupCount,
    outstandingBalancesCount,
    tasks,
    allTasks,
    taskTypes,
    selectedMatter,
    isMatterModalOpen,
    selectedTask,
    isTaskModalOpen,
    mattersCurrentPage,
    totalMattersCount,
    tasksCurrentPage,
    totalTasksCount,
    handleTaskClick,
    handleMatterClick,
    setIsMatterModalOpen,
    setIsTaskModalOpen,
    setMattersCurrentPage,
    setTasksCurrentPage,
    mattersPerPage,
    tasksPerPage,
  } = useClioData(isClioConnected, matterFilter, sortOption, taskFilter, taskSortOption, taskPriorityFilter, taskTypeFilter);

  const {
    emails,
    loadingEmails,
    emailError,
    selectedEmail,
    setSelectedEmail,
    handleMarkUnread,
    handleHide,
    handleCloseModal,
  } = useEmails();

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

  useEffect(() => {
    if (searchParams.get('clioAuth') === 'success') {
      setIsClioConnected(true);
      setActiveTab('matters');
    }
  }, [searchParams]);

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

  const processTasksForChart = (tasks: any[]) => {
    const categoryColors: { [key: string]: string } = {
      'Research': 'bg-green-500',
      'Calls': 'bg-teal-500',
      'Drafting': 'bg-blue-500',
      'Emails': 'bg-pink-500',
      'Files': 'bg-purple-500',
      'Meetings': 'bg-amber-600',
      'Review': 'bg-red-500',
      'Default': 'bg-gray-500',
    };

    const categoryCounts = tasks.reduce((acc: { [key: string]: number }, task) => {
      const category = task.task_type?.name || 'No Category';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(categoryCounts).map(([name, count]) => ({
      name,
      count,
      color: categoryColors[name] || categoryColors['Default'],
    }));
  };

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Morning');
    else if (hour < 18) setGreeting('Afternoon');
    else setGreeting('Evening');
  }, []);

  const indexOfLastEmail = currentPage * emailsPerPage;
  const indexOfFirstEmail = indexOfLastEmail - emailsPerPage;
  const currentEmails = emails.slice(indexOfFirstEmail, indexOfLastEmail);
  const totalPages = Math.ceil(emails.length / emailsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <div className="min-h-screen bg-gray-100 pb-32">
      <Header activeTab="personal-dashboard" onTabChange={onTabChange} />
      <main className="max-w-7xl mx-auto px-8 pt-8 pb-16">
        {/* Greeting Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Good {greeting}, {session?.user?.name?.split(' ')[0]}! 👋</h1>
          <p className="text-gray-600">Here&apos;s what&apos;s happening with your legal work today</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <KPICard title="Pending Matters" value={pendingMattersCount.toString()} color="blue" />
          <KPICard title="Matters with pending balance" value={billsAwaitingPaymentCount.toString()} color="orange" />
          <KPICard title="Clients due for followup" value={clientsDueForFollowupCount.toString()} color="green" />
          <KPICard title="Outstanding Balances" value={outstandingBalancesCount.toString()} color="red" />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
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
                  <button
                    onClick={() => setActiveTab('matters')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeTab === 'matters'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    Matters
                  </button>
                </div>
              </div>

              {activeTab === 'emails' && (
                <EmailTabContent
                  loadingEmails={loadingEmails}
                  emailError={emailError}
                  emails={emails}
                  currentEmails={currentEmails}
                  emailsPerPage={emailsPerPage}
                  currentPage={currentPage}
                  totalPages={totalPages}
                  setSelectedEmail={setSelectedEmail}
                  handleMarkUnread={handleMarkUnread}
                  handleHide={handleHide}
                  paginate={paginate}
                />
              )}

              {activeTab === 'tasks' && (
                <TaskTabContent
                  loadingClio={loadingClio}
                  allTasks={allTasks}
                  totalTasksCount={totalTasksCount}
                  tasks={tasks}
                  handleTaskClick={handleTaskClick}
                  getCategoryColor={getCategoryColor}
                  tasksCurrentPage={tasksCurrentPage}
                  tasksPerPage={tasksPerPage}
                  setTasksCurrentPage={setTasksCurrentPage}
                  processTasksForChart={processTasksForChart}
                  taskFilter={taskFilter}
                  setTaskFilter={setTaskFilter}
                  taskPriorityFilter={taskPriorityFilter}
                  setTaskPriorityFilter={setTaskPriorityFilter}
                  taskSortOption={taskSortOption}
                  setTaskSortOption={setTaskSortOption}
                  taskTypes={taskTypes}
                  taskTypeFilter={taskTypeFilter}
                  setTaskTypeFilter={setTaskTypeFilter}
                />
              )}

              {activeTab === 'matters' && (
                <MatterTabContent
                  isClioConnected={isClioConnected}
                  handleConnectClio={handleConnectClio}
                  loadingClio={loadingClio}
                  clioError={clioError}
                  clioMatters={clioMatters}
                  handleMatterClick={handleMatterClick}
                  totalMattersCount={totalMattersCount}
                  mattersCurrentPage={mattersCurrentPage}
                  mattersPerPage={mattersPerPage}
                  setMattersCurrentPage={setMattersCurrentPage}
                  matterFilter={matterFilter}
                  setMatterFilter={setMatterFilter}
                  sortOption={sortOption}
                  setSortOption={setSortOption}
                />
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
      <MatterModal isOpen={isMatterModalOpen} onClose={() => setIsMatterModalOpen(false)} matter={selectedMatter} />
      <TaskModal isOpen={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} task={selectedTask} />
    </div>
  );
};

export default PersonalDashboard;
