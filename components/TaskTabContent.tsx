'use client';

import React from 'react';
import DonutChart from './DonutChart';
import TaskSkeleton from './TaskSkeleton';

interface TaskTabContentProps {
  loadingClio: boolean;
  allTasks: any[];
  totalTasksCount: number;
  tasks: any[];
  handleTaskClick: (taskId: string) => void;
  getCategoryColor: (category: string) => string;
  tasksCurrentPage: number;
  tasksPerPage: number;
  setTasksCurrentPage: (page: number) => void;
  processTasksForChart: (tasks: any[]) => { name: string; count: number; color: string }[];
}

const TaskTabContent: React.FC<TaskTabContentProps> = ({
  loadingClio,
  allTasks,
  totalTasksCount,
  tasks,
  handleTaskClick,
  getCategoryColor,
  tasksCurrentPage,
  tasksPerPage,
  setTasksCurrentPage,
  processTasksForChart,
}) => {
  return (
    <div>
      <DonutChart data={processTasksForChart(allTasks)} total={totalTasksCount} />

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
