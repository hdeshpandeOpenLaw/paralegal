'use client';

import React from 'react';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: any; // Replace 'any' with a more specific type for the task
}

const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, task }) => {
  if (!isOpen || !task) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-2xl max-h-full overflow-y-auto">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-2xl font-bold text-gray-900">{task.name}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {task.description && (
          <div className="mb-6">
            <p className="text-md text-gray-800">{task.description}</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-gray-200 pt-6">
          <p><strong>Status:</strong> {task.status}</p>
          <p><strong>Priority:</strong> {task.priority}</p>
          <p><strong>Due Date:</strong> {task.due_at ? new Date(task.due_at).toLocaleDateString() : 'N/A'}</p>
          <p><strong>Completed Date:</strong> {task.completed_at ? new Date(task.completed_at).toLocaleDateString() : 'N/A'}</p>
          {task.matter && <p><strong>Matter:</strong> {task.matter.display_number}</p>}
          {task.assignees && task.assignees.length > 0 && (
            <p><strong>Assignees:</strong> {task.assignees.map((a: any) => a.name).join(', ')}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskModal;

