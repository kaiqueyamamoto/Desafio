'use client';

import { TaskStatus } from '@/types';
import { Task } from '@/types';

interface StatusCountersProps {
  tasks: Task[];
  onFilterChange: (status: TaskStatus) => void;
}

export default function StatusCounters({ tasks, onFilterChange }: StatusCountersProps) {
  const pendingCount = tasks.filter((task) => task.status === TaskStatus.PENDING).length;
  const inProgressCount = tasks.filter((task) => task.status === TaskStatus.IN_PROGRESS).length;
  const completedCount = tasks.filter((task) => task.status === TaskStatus.COMPLETED).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 border-l-4 border-yellow-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pendentes</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{pendingCount}</p>
          </div>
          <button
            onClick={() => onFilterChange(TaskStatus.PENDING)}
            className="px-3 py-1 text-xs font-medium text-yellow-700 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30 rounded-md hover:bg-yellow-200 dark:hover:bg-yellow-900/50 transition-colors"
          >
            Ver todas
          </button>
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 border-l-4 border-blue-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Em Progresso</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{inProgressCount}</p>
          </div>
          <button
            onClick={() => onFilterChange(TaskStatus.IN_PROGRESS)}
            className="px-3 py-1 text-xs font-medium text-blue-700 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 rounded-md hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
          >
            Ver todas
          </button>
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 border-l-4 border-green-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Concluídas</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{completedCount}</p>
          </div>
          <button
            onClick={() => onFilterChange(TaskStatus.COMPLETED)}
            className="px-3 py-1 text-xs font-medium text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/30 rounded-md hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
          >
            Ver todas
          </button>
        </div>
      </div>
    </div>
  );
}
