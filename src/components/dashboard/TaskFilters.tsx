'use client';

import { TaskStatus } from '@/types';

interface TaskFiltersProps {
  statusFilter: TaskStatus | 'all';
  onFilterChange: (filter: TaskStatus | 'all') => void;
}

export default function TaskFilters({ statusFilter, onFilterChange }: TaskFiltersProps) {
  return (
    <div className="flex space-x-2">
      <button
        onClick={(e) => {
          e.stopPropagation();
          onFilterChange('all');
        }}
        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
          statusFilter === 'all'
            ? 'bg-indigo-600 dark:bg-indigo-700 text-white'
            : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600'
        }`}
      >
        Todas
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onFilterChange(TaskStatus.PENDING);
        }}
        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
          statusFilter === TaskStatus.PENDING
            ? 'bg-indigo-600 dark:bg-indigo-700 text-white'
            : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600'
        }`}
      >
        Pendentes
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onFilterChange(TaskStatus.IN_PROGRESS);
        }}
        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
          statusFilter === TaskStatus.IN_PROGRESS
            ? 'bg-indigo-600 dark:bg-indigo-700 text-white'
            : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600'
        }`}
      >
        Em Progresso
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onFilterChange(TaskStatus.COMPLETED);
        }}
        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
          statusFilter === TaskStatus.COMPLETED
            ? 'bg-indigo-600 dark:bg-indigo-700 text-white'
            : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600'
        }`}
      >
        Concluídas
      </button>
    </div>
  );
}
