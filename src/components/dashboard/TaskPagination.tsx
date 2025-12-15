'use client';

interface TaskPaginationProps {
  page: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  onPageChange: (page: number) => void;
  limit: number;
  onLimitChange: (limit: number) => void;
  total: number;
}

export default function TaskPagination({
  page,
  totalPages,
  hasNextPage,
  hasPrevPage,
  onPageChange,
  limit,
  onLimitChange,
  total,
}: TaskPaginationProps) {
  const limitOptions = [10, 20, 30, 50, 100];

  if (totalPages <= 1 && total <= limit) return null;

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (page <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (page >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = page - 1; i <= page + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 gap-4">
      <div className="flex items-center space-x-2">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={!hasPrevPage}
          className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
            hasPrevPage
              ? 'bg-indigo-600 text-white hover:bg-indigo-700'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
          }`}
        >
          Anterior
        </button>
        <div className="flex items-center space-x-1">
          {getPageNumbers().map((pageNum, index) => (
            <button
              key={index}
              onClick={() => typeof pageNum === 'number' && onPageChange(pageNum)}
              disabled={pageNum === '...' || pageNum === page}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                pageNum === page
                  ? 'bg-indigo-600 text-white'
                  : pageNum === '...'
                  ? 'text-gray-400 dark:text-gray-500 cursor-default'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {pageNum}
            </button>
          ))}
        </div>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={!hasNextPage}
          className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
            hasNextPage
              ? 'bg-indigo-600 text-white hover:bg-indigo-700'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
          }`}
        >
          Próxima
        </button>
      </div>
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <label className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
            Itens por página:
          </label>
          <select
            value={limit}
            onChange={(e) => onLimitChange(Number(e.target.value))}
            className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
          >
            {limitOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
          Página {page} de {totalPages} ({total} total)
        </div>
      </div>
    </div>
  );
}
