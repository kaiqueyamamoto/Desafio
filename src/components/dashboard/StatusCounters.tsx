'use client';

import { TaskStatus } from '@/types';
import { Task } from '@/types';

interface StatusCountersProps {
  tasks: Task[];
  onFilterChange: (status: TaskStatus) => void;
  isLoading?: boolean;
}

export default function StatusCounters({ tasks, onFilterChange, isLoading = false }: StatusCountersProps) {
  const pendingCount = tasks.filter((task) => task.status === TaskStatus.PENDING).length;
  const inProgressCount = tasks.filter((task) => task.status === TaskStatus.IN_PROGRESS).length;
  const completedCount = tasks.filter((task) => task.status === TaskStatus.COMPLETED).length;

  const CounterCard = ({
    label,
    count,
    borderColor,
    buttonColor,
    buttonBgColor,
    buttonHoverColor,
    status,
  }: {
    label: string;
    count: number;
    borderColor: string;
    buttonColor: string;
    buttonBgColor: string;
    buttonHoverColor: string;
    status: TaskStatus;
  }) => (
    <div className={`bg-white dark:bg-gray-800 shadow rounded-lg p-4 border-l-4 ${borderColor}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{label}</p>
          {isLoading ? (
            <div className="h-8 w-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mt-1"></div>
          ) : (
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{count}</p>
          )}
        </div>
        <button
          onClick={() => onFilterChange(status)}
          disabled={isLoading}
          className={`px-3 py-1 text-xs font-medium ${buttonColor} ${buttonBgColor} rounded-md ${buttonHoverColor} transition-colors relative ${
            isLoading ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
          }`}
        >
          {isLoading ? (
            <span className="flex items-center space-x-1">
              <svg
                className="animate-spin h-3 w-3"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span>Carregando...</span>
            </span>
          ) : (
            'Ver todas'
          )}
        </button>
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <CounterCard
        label="Pendentes"
        count={pendingCount}
        borderColor="border-yellow-500"
        buttonColor="text-yellow-700 dark:text-yellow-400"
        buttonBgColor="bg-yellow-100 dark:bg-yellow-900/30"
        buttonHoverColor="hover:bg-yellow-200 dark:hover:bg-yellow-900/50"
        status={TaskStatus.PENDING}
      />
      <CounterCard
        label="Em Progresso"
        count={inProgressCount}
        borderColor="border-blue-500"
        buttonColor="text-blue-700 dark:text-blue-400"
        buttonBgColor="bg-blue-100 dark:bg-blue-900/30"
        buttonHoverColor="hover:bg-blue-200 dark:hover:bg-blue-900/50"
        status={TaskStatus.IN_PROGRESS}
      />
      <CounterCard
        label="Concluídas"
        count={completedCount}
        borderColor="border-green-500"
        buttonColor="text-green-700 dark:text-green-400"
        buttonBgColor="bg-green-100 dark:bg-green-900/30"
        buttonHoverColor="hover:bg-green-200 dark:hover:bg-green-900/50"
        status={TaskStatus.COMPLETED}
      />
    </div>
  );
}
