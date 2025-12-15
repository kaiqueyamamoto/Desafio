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
}: TaskListProps) {
  const getStatusLabel = (status: TaskStatus | 'all'): string => {
    if (status === 'all') return 'todas';
    if (status === TaskStatus.PENDING) return 'pendente';
    if (status === TaskStatus.IN_PROGRESS) return 'em progresso';
    return 'concluída';
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden transition-colors">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Suas Tarefas ({filteredTasks.length} de {allTasks.length})
          </h2>
        </div>
        <TaskFilters statusFilter={statusFilter} onFilterChange={onFilterChange} />
      </div>
      {filteredTasks.length === 0 ? (
        <div className="px-6 py-8 text-center text-gray-700 dark:text-gray-400">
          {allTasks.length === 0
            ? 'Nenhuma tarefa criada ainda. Crie sua primeira tarefa acima!'
            : `Nenhuma tarefa com status "${getStatusLabel(statusFilter)}" encontrada.`}
        </div>
      ) : (
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {filteredTasks.map((task) => (
            <li key={task.id} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
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
