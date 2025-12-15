'use client';

import { useCreateTask } from '@/lib/hooks/use-tasks';

interface TaskFormProps {
  title: string;
  description: string;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function TaskForm({
  title,
  description,
  onTitleChange,
  onDescriptionChange,
  onSubmit,
}: TaskFormProps) {
  const createTaskMutation = useCreateTask();

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6 transition-colors">
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Nova Tarefa</h2>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label htmlFor="task-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Título da tarefa
          </label>
          <input
            id="task-title"
            type="text"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="Digite o título da tarefa"
            className="w-full px-3 py-2 border-2 border-gray-400 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            required
          />
        </div>
        <div>
          <label htmlFor="task-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Descrição (opcional)
          </label>
          <textarea
            id="task-description"
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder="Digite a descrição da tarefa"
            rows={3}
            className="w-full px-3 py-2 border-2 border-gray-400 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
          />
        </div>
        <button
          type="submit"
          disabled={createTaskMutation.isPending}
          className="px-4 py-2 bg-indigo-600 dark:bg-indigo-700 text-white rounded-md hover:bg-indigo-700 dark:hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-colors"
        >
          {createTaskMutation.isPending && (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          )}
          <span>{createTaskMutation.isPending ? 'Criando...' : 'Criar Tarefa'}</span>
        </button>
      </form>
    </div>
  );
}
