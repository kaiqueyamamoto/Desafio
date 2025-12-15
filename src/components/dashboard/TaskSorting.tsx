'use client';

interface TaskSortingProps {
  sortBy: 'created_at' | 'updated_at' | 'title' | 'status';
  sortOrder: 'asc' | 'desc';
  onSortChange: (sortBy: 'created_at' | 'updated_at' | 'title' | 'status', sortOrder: 'asc' | 'desc') => void;
  isLoading?: boolean;
}

export default function TaskSorting({ sortBy, sortOrder, onSortChange, isLoading = false }: TaskSortingProps) {
  return (
    <div className="flex items-center space-x-4 mb-4">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Ordenar por:
      </label>
      <select
        value={sortBy}
        onChange={(e) => onSortChange(e.target.value as any, sortOrder)}
        disabled={isLoading}
        className={`px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
          isLoading ? 'opacity-60 cursor-not-allowed' : ''
        }`}
      >
        <option value="created_at">Data de Criação</option>
        <option value="updated_at">Data de Atualização</option>
        <option value="title">Título</option>
        <option value="status">Status</option>
      </select>
      <button
        onClick={() => onSortChange(sortBy, sortOrder === 'asc' ? 'desc' : 'asc')}
        disabled={isLoading}
        className={`px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 relative ${
          isLoading ? 'opacity-60 cursor-not-allowed' : ''
        }`}
        title={sortOrder === 'asc' ? 'Crescente' : 'Decrescente'}
      >
        {isLoading ? (
          <svg
            className="animate-spin h-5 w-5 text-indigo-600 dark:text-indigo-400"
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
        ) : sortOrder === 'asc' ? (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </button>
    </div>
  );
}
