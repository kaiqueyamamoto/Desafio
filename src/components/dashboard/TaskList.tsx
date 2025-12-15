'use client';

import { Task, TaskStatus } from '@/types';
import TaskCard from './TaskCard';
import TaskFilters from './TaskFilters';

interface TaskListProps {
  allTasks: Task[];
  filteredTasks: Task[];
  statusFilter: TaskStatus | 'all';
  onFilterChange: (filter: TaskStatus | 'all') => void;
  editingTaskId: number | null;
  editTaskTitle: string;
  editTaskDescription: string;
  onEditTaskTitleChange: (value: string) => void;
  onEditTaskDescriptionChange: (value: string) => void;
  onStartEdit: (task: Task) => void;
  onCancelEdit: () => void;
  onSaveEdit: (taskId: number) => void;
  onToggleTask: (task: Task) => void;
  onChangeStatus: (taskId: number, newStatus: TaskStatus) => void;
  onDeleteTask: (id: number) => void;
  isLoading?: boolean;
}

export default function TaskList({
  allTasks,
  filteredTasks,
  statusFilter,
  onFilterChange,
  editingTaskId,
  editTaskTitle,
  editTaskDescription,
  onEditTaskTitleChange,
  onEditTaskDescriptionChange,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onToggleTask,
  onChangeStatus,
  onDeleteTask,
  isLoading = false,
}: TaskListProps) {
  const getStatusLabel = (status: TaskStatus | 'all'): string => {
    if (status === 'all') return 'todas';
    if (status === TaskStatus.PENDING) return 'pendente';
    if (status === TaskStatus.IN_PROGRESS) return 'em progresso';
    return 'concluída';
  };

  // Componente de skeleton para loading
  const TaskSkeleton = () => (
    <li className="px-6 py-4 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
        </div>
        <div className="flex space-x-2">
          <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    </li>
  );

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden transition-all duration-300 ease-in-out">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white transition-all duration-200">
            {isLoading ? (
              <span className="flex items-center space-x-2">
                <span>Suas Tarefas</span>
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
              </span>
            ) : (
              `Suas Tarefas (${filteredTasks.length})`
            )}
          </h2>
        </div>
        <TaskFilters statusFilter={statusFilter} onFilterChange={onFilterChange} isLoading={isLoading} />
      </div>
      {isLoading ? (
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {[...Array(3)].map((_, index) => (
            <TaskSkeleton key={index} />
          ))}
        </ul>
      ) : filteredTasks.length === 0 ? (
        <div className="px-6 py-8 text-center text-gray-700 dark:text-gray-400">
          Nenhuma tarefa encontrada. Tente ajustar os filtros ou criar uma nova tarefa.
        </div>
      ) : (
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {filteredTasks.map((task, index) => (
            <li 
              key={task.id} 
              className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200 ease-in-out animate-fade-in"
              style={{
                animationDelay: `${index * 50}ms`,
                animationFillMode: 'both',
              }}
            >
              <TaskCard
                task={task}
                isEditing={editingTaskId === task.id}
                editTitle={editTaskTitle}
                editDescription={editTaskDescription}
                onEditTitleChange={onEditTaskTitleChange}
                onEditDescriptionChange={onEditTaskDescriptionChange}
                onStartEdit={() => onStartEdit(task)}
                onCancelEdit={onCancelEdit}
                onSaveEdit={onSaveEdit}
                onToggleTask={onToggleTask}
                onChangeStatus={onChangeStatus}
                onDeleteTask={onDeleteTask}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
