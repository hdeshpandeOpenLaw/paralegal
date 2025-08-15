'use client';

import React from 'react';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: any; // Replace 'any' with a more specific type for the task
}

const DetailItem = ({ label, value }: { label: string, value: React.ReactNode }) => {
  if (!value) return null;
  return (
    <div>
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="text-md text-gray-900">{value}</p>
    </div>
  );
};

const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, task }) => {
  if (!isOpen || !task) return null;

  const getPriorityColor = (priority: string) => {
    const colors: { [key: string]: string } = {
      'high': 'bg-red-100 text-red-700',
      'normal': 'bg-blue-100 text-blue-700',
      'low': 'bg-green-100 text-green-700',
    };
    return colors[priority.toLowerCase()] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-3xl max-h-full overflow-y-auto">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{task.name}</h2>
            {task.description && (
              <p className="text-lg text-gray-700">{task.description}</p>
            )}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="border-t border-gray-200 pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            <DetailItem label="Status" value={task.status} />
            <DetailItem 
              label="Priority" 
              value={
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                  {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                </span>
              } 
            />
            <DetailItem label="Due Date" value={task.due_at ? new Date(task.due_at).toLocaleDateString() : 'N/A'} />
            <DetailItem label="Completed Date" value={task.completed_at ? new Date(task.completed_at).toLocaleDateString() : 'N/A'} />
            <DetailItem label="Matter" value={task.matter?.display_number} />
            <DetailItem label="Assignees" value={task.assignees?.map((a: any) => a.name).join(', ')} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskModal;