'use client';

import { Task, TaskStatus } from '@/types';
import { useUpdateTask, useDeleteTask } from '@/lib/hooks/use-tasks';

interface TaskCardProps {
  task: Task;
  isEditing: boolean;
  editTitle: string;
  editDescription: string;
  onEditTitleChange: (value: string) => void;
  onEditDescriptionChange: (value: string) => void;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSaveEdit: (taskId: number) => void;
  onToggleTask: (task: Task) => void;
  onChangeStatus: (taskId: number, newStatus: TaskStatus) => void;
  onDeleteTask: (id: number) => void;
}

export default function TaskCard({
  task,
  isEditing,
  editTitle,
  editDescription,
  onEditTitleChange,
  onEditDescriptionChange,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onToggleTask,
  onChangeStatus,
  onDeleteTask,
}: TaskCardProps) {
  const updateTaskMutation = useUpdateTask();
  const deleteTaskMutation = useDeleteTask();

  if (isEditing) {
    return (
      <div className="space-y-4">
        <div>
          <label htmlFor={`edit-title-${task.id}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Título da tarefa
          </label>
          <input
            id={`edit-title-${task.id}`}
            type="text"
            value={editTitle}
            onChange={(e) => onEditTitleChange(e.target.value)}
            className="w-full px-3 py-2 border-2 border-gray-400 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            placeholder="Digite o título da tarefa"
          />
        </div>
        <div>
          <label htmlFor={`edit-description-${task.id}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Descrição (opcional)
          </label>
          <textarea
            id={`edit-description-${task.id}`}
            value={editDescription}
            onChange={(e) => onEditDescriptionChange(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border-2 border-gray-400 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            placeholder="Digite a descrição da tarefa"
          />
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => onSaveEdit(task.id)}
            disabled={updateTaskMutation.isPending || !editTitle.trim()}
            className="px-4 py-2 bg-indigo-600 dark:bg-indigo-700 text-white rounded-md hover:bg-indigo-700 dark:hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-colors"
          >
            {updateTaskMutation.isPending && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            )}
            <span>{updateTaskMutation.isPending ? 'Salvando...' : 'Salvar'}</span>
          </button>
          <button
            onClick={onCancelEdit}
            disabled={updateTaskMutation.isPending}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <div className="flex items-center space-x-3 flex-wrap gap-2">
          <label 
            className="relative inline-flex items-center cursor-pointer group"
            onClick={(e) => e.stopPropagation()}
          >
            <input
              type="checkbox"
              checked={task.status === TaskStatus.COMPLETED}
              onChange={(e) => {
                e.stopPropagation();
                onToggleTask(task);
              }}
              disabled={updateTaskMutation.isPending}
              className="sr-only"
            />
            <div
              className={`relative w-6 h-6 rounded-md border-2 transition-all duration-200 ease-in-out flex items-center justify-center ${
                task.status === TaskStatus.COMPLETED
                  ? 'bg-indigo-600 dark:bg-indigo-500 border-indigo-600 dark:border-indigo-500'
                  : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 group-hover:border-indigo-400 dark:group-hover:border-indigo-500'
              } ${
                updateTaskMutation.isPending
                  ? 'opacity-50 cursor-not-allowed'
                  : 'cursor-pointer'
              } focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 dark:focus-within:ring-offset-gray-800`}
            >
              {task.status === TaskStatus.COMPLETED && (
                <svg
                  className="w-4 h-4 text-white transition-all duration-200 ease-in-out"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="3"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M5 13l4 4L19 7"></path>
                </svg>
              )}
            </div>
          </label>
          <h3
            className={`text-lg font-medium ${
              task.status === TaskStatus.COMPLETED
                ? 'line-through text-gray-500 dark:text-gray-400'
                : 'text-gray-900 dark:text-white'
            }`}
          >
            {task.title}
          </h3>
          <span
            className={`px-2 py-1 text-xs font-semibold rounded ${
              task.status === TaskStatus.COMPLETED
                ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                : task.status === TaskStatus.IN_PROGRESS
                ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
            }`}
          >
            {task.status === TaskStatus.COMPLETED
              ? 'Concluída'
              : task.status === TaskStatus.IN_PROGRESS
              ? 'Em Progresso'
              : 'Pendente'}
          </span>
          {/* Seletor de Status */}
          <div className="flex items-center space-x-1 ml-2" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onChangeStatus(task.id, TaskStatus.PENDING);
              }}
              disabled={updateTaskMutation.isPending || task.status === TaskStatus.PENDING}
              className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
                task.status === TaskStatus.PENDING
                  ? 'bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 cursor-default'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              title="Marcar como Pendente"
            >
              Pendente
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onChangeStatus(task.id, TaskStatus.IN_PROGRESS);
              }}
              disabled={updateTaskMutation.isPending || task.status === TaskStatus.IN_PROGRESS}
              className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
                task.status === TaskStatus.IN_PROGRESS
                  ? 'bg-yellow-200 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200 cursor-default'
                  : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 hover:bg-yellow-200 dark:hover:bg-yellow-900/50'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              title="Marcar como Em Progresso"
            >
              Em Progresso
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onChangeStatus(task.id, TaskStatus.COMPLETED);
              }}
              disabled={updateTaskMutation.isPending || task.status === TaskStatus.COMPLETED}
              className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
                task.status === TaskStatus.COMPLETED
                  ? 'bg-green-200 dark:bg-green-900/50 text-green-800 dark:text-green-200 cursor-default'
                  : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              title="Marcar como Concluída"
            >
              Concluída
            </button>
          </div>
        </div>
        {task.description && (
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{task.description}</p>
        )}
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-500">
          Criada em:{' '}
          {new Date(task.created_at).toLocaleDateString('pt-BR')}
        </p>
      </div>
      <div className="flex space-x-2 ml-4" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onStartEdit();
          }}
          disabled={updateTaskMutation.isPending || deleteTaskMutation.isPending}
          className="px-3 py-1 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1 transition-colors"
        >
          {(updateTaskMutation.isPending || deleteTaskMutation.isPending) && (
            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
          )}
          <span>Editar</span>
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDeleteTask(task.id);
          }}
          disabled={deleteTaskMutation.isPending || updateTaskMutation.isPending}
          className="px-3 py-1 text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1 transition-colors"
        >
          {(deleteTaskMutation.isPending || updateTaskMutation.isPending) && (
            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-600 dark:border-red-400"></div>
          )}
          <span>Deletar</span>
        </button>
      </div>
    </div>
  );
}
