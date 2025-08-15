'use client';

import React from 'react';
import DonutChart from './DonutChart';
import TaskSkeleton from './TaskSkeleton';

interface TaskTabContentProps {
  loadingClio: boolean;
  allTasks: any[];
  totalTasksCount: number;
  tasks: any[];
  taskTypes: any[];
  handleTaskClick: (taskId: string) => void;
  getCategoryColor: (category: string) => string;
  tasksCurrentPage: number;
  tasksPerPage: number;
  setTasksCurrentPage: (page: number) => void;
  processTasksForChart: (tasks: any[]) => { name: string; count: number; color: string }[];
  taskFilter: string;
  setTaskFilter: (filter: string) => void;
  taskPriorityFilter: string;
  setTaskPriorityFilter: (priority: string) => void;
  taskSortOption: string;
  setTaskSortOption: (sort: string) => void;
  taskTypeFilter: string;
  setTaskTypeFilter: (filter: string) => void;
}

const TaskTabContent: React.FC<TaskTabContentProps> = ({
  loadingClio,
  allTasks,
  totalTasksCount,
  tasks,
  taskTypes,
  handleTaskClick,
  getCategoryColor,
  tasksCurrentPage,
  tasksPerPage,
  setTasksCurrentPage,
  processTasksForChart,
  taskFilter,
  setTaskFilter,
  taskPriorityFilter,
  setTaskPriorityFilter,
  taskSortOption,
  setTaskSortOption,
  taskTypeFilter,
  setTaskTypeFilter,
}) => {
  const [showFilterMenu, setShowFilterMenu] = React.useState(false);
  const [showSortMenu, setShowSortMenu] = React.useState(false);
  const [showPrioritySubMenu, setShowPrioritySubMenu] = React.useState(false);
  const [showSortPrioritySubMenu, setShowSortPrioritySubMenu] = React.useState(false);
  const [showSortDateSubMenu, setShowSortDateSubMenu] = React.useState(false);
  const [showStatusSubMenu, setShowStatusSubMenu] = React.useState(false);
  const [showCategorySubMenu, setShowCategorySubMenu] = React.useState(false);
  const [openCategoryUp, setOpenCategoryUp] = React.useState(false);
  const [openStatusUp, setOpenStatusUp] = React.useState(false);
  const [openPriorityUp, setOpenPriorityUp] = React.useState(false);
  const [openSortDateUp, setOpenSortDateUp] = React.useState(false);
  const [openSortPriorityUp, setOpenSortPriorityUp] = React.useState(false);
  const filterMenuRef = React.useRef<HTMLDivElement>(null);
  const sortMenuRef = React.useRef<HTMLDivElement>(null);
  const categorySubMenuRef = React.useRef<HTMLDivElement>(null);
  const statusSubMenuRef = React.useRef<HTMLDivElement>(null);
  const prioritySubMenuRef = React.useRef<HTMLDivElement>(null);
  const sortDateSubMenuRef = React.useRef<HTMLDivElement>(null);
  const sortPrioritySubMenuRef = React.useRef<HTMLDivElement>(null);

  React.useLayoutEffect(() => {
    if (showCategorySubMenu && categorySubMenuRef.current) {
      const rect = categorySubMenuRef.current.getBoundingClientRect();
      if (rect.bottom > window.innerHeight) {
        setOpenCategoryUp(true);
      } else {
        setOpenCategoryUp(false);
      }
    }
    if (showStatusSubMenu && statusSubMenuRef.current) {
      const rect = statusSubMenuRef.current.getBoundingClientRect();
      if (rect.bottom > window.innerHeight) {
        setOpenStatusUp(true);
      } else {
        setOpenStatusUp(false);
      }
    }
    if (showPrioritySubMenu && prioritySubMenuRef.current) {
      const rect = prioritySubMenuRef.current.getBoundingClientRect();
      if (rect.bottom > window.innerHeight) {
        setOpenPriorityUp(true);
      } else {
        setOpenPriorityUp(false);
      }
    }
    if (showSortDateSubMenu && sortDateSubMenuRef.current) {
      const rect = sortDateSubMenuRef.current.getBoundingClientRect();
      if (rect.bottom > window.innerHeight) {
        setOpenSortDateUp(true);
      } else {
        setOpenSortDateUp(false);
      }
    }
    if (showSortPrioritySubMenu && sortPrioritySubMenuRef.current) {
      const rect = sortPrioritySubMenuRef.current.getBoundingClientRect();
      if (rect.bottom > window.innerHeight) {
        setOpenSortPriorityUp(true);
      } else {
        setOpenSortPriorityUp(false);
      }
    }
  }, [showCategorySubMenu, showStatusSubMenu, showPrioritySubMenu, showSortDateSubMenu, showSortPrioritySubMenu]);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterMenuRef.current && !filterMenuRef.current.contains(event.target as Node)) {
        setShowFilterMenu(false);
        setShowPrioritySubMenu(false);
        setShowStatusSubMenu(false);
        setShowCategorySubMenu(false);
      }
      if (sortMenuRef.current && !sortMenuRef.current.contains(event.target as Node)) {
        setShowSortMenu(false);
        setShowSortPrioritySubMenu(false);
        setShowSortDateSubMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [filterMenuRef, sortMenuRef]);

  const getPriorityColor = (priority: string) => {
    const colors: { [key: string]: string } = {
      'high': 'bg-red-100 text-red-700',
      'normal': 'bg-blue-100 text-blue-700',
      'low': 'bg-green-100 text-green-700',
    };
    return colors[priority.toLowerCase()] || 'bg-gray-100 text-gray-700';
  };

  const handleFilterSubMenu = (submenu: 'status' | 'priority' | 'category') => {
    setShowStatusSubMenu(submenu === 'status' ? !showStatusSubMenu : false);
    setShowPrioritySubMenu(submenu === 'priority' ? !showPrioritySubMenu : false);
    setShowCategorySubMenu(submenu === 'category' ? !showCategorySubMenu : false);
  };

  const handleSortSubMenu = (submenu: 'date' | 'priority') => {
    setShowSortDateSubMenu(submenu === 'date' ? !showSortDateSubMenu : false);
    setShowSortPrioritySubMenu(submenu === 'priority' ? !showSortPrioritySubMenu : false);
  };

  return (
    <div>
      <DonutChart data={processTasksForChart(allTasks)} total={totalTasksCount} />

      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Tasks</h3>
          <div className="flex items-center">
            <div className="relative" ref={filterMenuRef}>
              <button
                onClick={() => setShowFilterMenu(!showFilterMenu)}
                className="p-2 rounded-full hover:bg-gray-200"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5 text-gray-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V19l-4 2v-5.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                  />
                </svg>
              </button>
              {showFilterMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                  <div className="py-1 relative">
                    <button onClick={() => handleFilterSubMenu('status')} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex justify-between items-center">
                      <span>Status</span>
                      <svg className={`w-4 h-4 transition-transform ${showStatusSubMenu ? 'transform rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                    </button>
                    {showStatusSubMenu && (
                      <div
                        ref={statusSubMenuRef}
                        className={`absolute left-full w-48 bg-white rounded-md shadow-lg z-20 ${openStatusUp ? 'bottom-0' : 'top-0'}`}
                      >
                        <div className="py-1">
                          <a href="#" onClick={(e) => { e.preventDefault(); setTaskFilter('pending'); setShowFilterMenu(false); setShowStatusSubMenu(false); }} className={`block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${taskFilter === 'pending' ? 'bg-gray-100 font-semibold' : ''}`}>Incomplete</a>
                          <a href="#" onClick={(e) => { e.preventDefault(); setTaskFilter('complete'); setShowFilterMenu(false); setShowStatusSubMenu(false); }} className={`block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${taskFilter === 'complete' ? 'bg-gray-100 font-semibold' : ''}`}>Complete</a>
                          <a href="#" onClick={(e) => { e.preventDefault(); setTaskFilter('All'); setShowFilterMenu(false); setShowStatusSubMenu(false); }} className={`block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${taskFilter === 'All' ? 'bg-gray-100 font-semibold' : ''}`}>All</a>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="border-t border-gray-200"></div>
                  <div className="py-1 relative">
                    <button onClick={() => handleFilterSubMenu('priority')} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex justify-between items-center">
                      <span>Priority</span>
                      <svg className={`w-4 h-4 transition-transform ${showPrioritySubMenu ? 'transform rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                    </button>
                    {showPrioritySubMenu && (
                      <div
                        ref={prioritySubMenuRef}
                        className={`absolute left-full w-48 bg-white rounded-md shadow-lg z-20 ${openPriorityUp ? 'bottom-0' : 'top-0'}`}
                      >
                        <div className="py-1">
                          <a href="#" onClick={(e) => { e.preventDefault(); setTaskPriorityFilter('High'); setShowFilterMenu(false); setShowPrioritySubMenu(false); }} className={`block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${taskPriorityFilter === 'High' ? 'bg-gray-100 font-semibold' : ''}`}>High Priority</a>
                          <a href="#" onClick={(e) => { e.preventDefault(); setTaskPriorityFilter('Normal'); setShowFilterMenu(false); setShowPrioritySubMenu(false); }} className={`block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${taskPriorityFilter === 'Normal' ? 'bg-gray-100 font-semibold' : ''}`}>Normal Priority</a>
                          <a href="#" onClick={(e) => { e.preventDefault(); setTaskPriorityFilter('Low'); setShowFilterMenu(false); setShowPrioritySubMenu(false); }} className={`block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${taskPriorityFilter === 'Low' ? 'bg-gray-100 font-semibold' : ''}`}>Low Priority</a>
                          <a href="#" onClick={(e) => { e.preventDefault(); setTaskPriorityFilter('All'); setShowFilterMenu(false); setShowPrioritySubMenu(false); }} className={`block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${taskPriorityFilter === 'All' ? 'bg-gray-100 font-semibold' : ''}`}>All Priorities</a>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="border-t border-gray-200"></div>
                  <div className="py-1 relative">
                    <button onClick={() => handleFilterSubMenu('category')} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex justify-between items-center">
                      <span>Category</span>
                      <svg className={`w-4 h-4 transition-transform ${showCategorySubMenu ? 'transform rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                    </button>
                    {showCategorySubMenu && (
                      <div
                        ref={categorySubMenuRef}
                        className={`absolute left-full w-48 bg-white rounded-md shadow-lg z-20 ${openCategoryUp ? 'bottom-0' : 'top-0'}`}
                      >
                        <div className="py-1">
                          <a href="#" onClick={(e) => { e.preventDefault(); setTaskTypeFilter(''); setShowFilterMenu(false); setShowCategorySubMenu(false); }} className={`block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${taskTypeFilter === '' ? 'bg-gray-100 font-semibold' : ''}`}>All</a>
                          {taskTypes.map((type) => (
                            <a
                              key={type.id}
                              href="#"
                              onClick={(e) => { e.preventDefault(); setTaskTypeFilter(type.id); setShowFilterMenu(false); setShowCategorySubMenu(false); }}
                              className={`block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${taskTypeFilter === type.id ? 'bg-gray-100 font-semibold' : ''}`}
                            >
                              {type.name}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="relative" ref={sortMenuRef}>
              <button
                onClick={() => setShowSortMenu(!showSortMenu)}
                className="p-2 rounded-full hover:bg-gray-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h18M3 8h12M3 12h8" />
                </svg>
              </button>
              {showSortMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                  <div className="py-1">
                    <a href="#" onClick={(e) => { e.preventDefault(); setTaskSortOption('Default'); setShowSortMenu(false); }} className={`block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${taskSortOption === 'Default' ? 'bg-gray-100 font-semibold' : ''}`}>Default</a>
                  </div>
                  <div className="border-t border-gray-200"></div>
                  <div className="py-1 relative">
                    <button onClick={() => handleSortSubMenu('date')} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex justify-between items-center">
                      <span>Due Date</span>
                      <svg className={`w-4 h-4 transition-transform ${showSortDateSubMenu ? 'transform rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                    </button>
                    {showSortDateSubMenu && (
                      <div
                        ref={sortDateSubMenuRef}
                        className={`absolute left-full w-48 bg-white rounded-md shadow-lg z-20 ${openSortDateUp ? 'bottom-0' : 'top-0'}`}
                      >
                        <div className="py-1">
                          <a href="#" onClick={(e) => { e.preventDefault(); setTaskSortOption('due_at(asc)'); setShowSortMenu(false); setShowSortDateSubMenu(false); }} className={`block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${taskSortOption === 'due_at(asc)' ? 'bg-gray-100 font-semibold' : ''}`}>Old First</a>
                          <a href="#" onClick={(e) => { e.preventDefault(); setTaskSortOption('due_at(desc)'); setShowSortMenu(false); setShowSortDateSubMenu(false); }} className={`block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${taskSortOption === 'due_at(desc)' ? 'bg-gray-100 font-semibold' : ''}`}>New First</a>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="border-t border-gray-200"></div>
                  <div className="py-1 relative">
                    <button onClick={() => handleSortSubMenu('priority')} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex justify-between items-center">
                      <span>Priority</span>
                      <svg className={`w-4 h-4 transition-transform ${showSortPrioritySubMenu ? 'transform rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                    </button>
                    {showSortPrioritySubMenu && (
                      <div
                        ref={sortPrioritySubMenuRef}
                        className={`absolute left-full w-48 bg-white rounded-md shadow-lg z-20 ${openSortPriorityUp ? 'bottom-0' : 'top-0'}`}
                      >
                        <div className="py-1">
                          <a href="#" onClick={(e) => { e.preventDefault(); setTaskSortOption('priority(desc)'); setShowSortMenu(false); setShowSortPrioritySubMenu(false); }} className={`block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${taskSortOption === 'priority(desc)' ? 'bg-gray-100 font-semibold' : ''}`}>High to Low</a>
                          <a href="#" onClick={(e) => { e.preventDefault(); setTaskSortOption('priority(asc)'); setShowSortMenu(false); setShowSortPrioritySubMenu(false); }} className={`block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${taskSortOption === 'priority(asc)' ? 'bg-gray-100 font-semibold' : ''}`}>Low to High</a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-700">Task name</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Category</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Priority</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Date created</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700"></th>
              </tr>
            </thead>
            <tbody>
              {loadingClio ? (
                <>
                  <TaskSkeleton />
                  <TaskSkeleton />
                  <TaskSkeleton />
                  <TaskSkeleton />
                  <TaskSkeleton />
                  <TaskSkeleton />
                </>
              ) : (
                tasks.map((task, index) => (
                  <tr
                    key={index}
                    className="border-b border-gray-100 cursor-pointer hover:bg-gray-50"
                    onClick={() => handleTaskClick(task.id)}
                  >
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900">{task.name}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          getCategoryColor(task.task_type?.name || 'No Category')
                        }`}
                      >
                        {task.task_type?.name || 'No Category'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          getPriorityColor(task.priority)
                        }`}
                      >
                        {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {new Date(task.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <button className="text-gray-400 hover:text-gray-600">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
          <span>
            Showing {totalTasksCount > 0 ? (tasksCurrentPage - 1) * tasksPerPage + 1 : 0}-
            {Math.min(tasksCurrentPage * tasksPerPage, totalTasksCount)} of {totalTasksCount} results
          </span>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setTasksCurrentPage(tasksCurrentPage - 1)}
              disabled={tasksCurrentPage === 1}
              className="p-1 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => setTasksCurrentPage(tasksCurrentPage + 1)}
              disabled={tasksCurrentPage * tasksPerPage >= totalTasksCount}
              className="p-1 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskTabContent;
