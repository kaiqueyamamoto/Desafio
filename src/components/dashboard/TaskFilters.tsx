'use client';

import { TaskStatus } from '@/types';

interface TaskFiltersProps {
  statusFilter: TaskStatus | 'all';
  onFilterChange: (filter: TaskStatus | 'all') => void;
  isLoading?: boolean;
}

export default function TaskFilters({ statusFilter, onFilterChange, isLoading = false }: TaskFiltersProps) {
  const FilterButton = ({
    label,
    filter,
    onClick,
  }: {
    label: string;
    filter: TaskStatus | 'all';
    onClick: () => void;
  }) => {
    const isActive = statusFilter === filter;
    const isDisabled = isLoading;

    return (
      <button
        onClick={(e) => {
          e.stopPropagation();
          if (!isDisabled) onClick();
        }}
        disabled={isDisabled}
        className={`px-4 py-2 rounded-md text-sm font-medium transition-all relative ${
          isActive
            ? 'bg-indigo-600 dark:bg-indigo-700 text-white'
            : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600'
        } ${
          isDisabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
        }`}
      >
        <span className={isLoading && isActive ? 'opacity-0' : ''}>{label}</span>
        {isLoading && isActive && (
          <span className="absolute inset-0 flex items-center justify-center">
            <svg
              className="animate-spin h-4 w-4 text-white"
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
          </span>
        )}
      </button>
    );
  };

  return (
    <div className="flex space-x-2">
      <FilterButton
        label="Todas"
        filter="all"
        onClick={() => onFilterChange('all')}
      />
      <FilterButton
        label="Pendentes"
        filter={TaskStatus.PENDING}
        onClick={() => onFilterChange(TaskStatus.PENDING)}
      />
      <FilterButton
        label="Em Progresso"
        filter={TaskStatus.IN_PROGRESS}
        onClick={() => onFilterChange(TaskStatus.IN_PROGRESS)}
      />
      <FilterButton
        label="Concluídas"
        filter={TaskStatus.COMPLETED}
        onClick={() => onFilterChange(TaskStatus.COMPLETED)}
      />
    </div>
  );
}
