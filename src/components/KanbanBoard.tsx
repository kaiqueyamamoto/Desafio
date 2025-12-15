'use client';

import { useState, useEffect } from 'react';
import { Task, TaskStatus } from '@/types';
import { useUpdateTask, useDeleteTask, useCreateTask } from '@/lib/hooks/use-tasks';

interface KanbanBoardProps {
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: number) => void;
  editingTaskId: number | null;
  editTaskTitle: string;
  editTaskDescription: string;
  onEditTaskTitleChange: (value: string) => void;
  onEditTaskDescriptionChange: (value: string) => void;
  onCancelEdit: () => void;
  onSaveEdit: (taskId: number) => void;
  updateTaskMutation: ReturnType<typeof useUpdateTask>;
  deleteTaskMutation: ReturnType<typeof useDeleteTask>;
  // Props para criação de tarefas
  newTaskTitle: string;
  newTaskDescription: string;
  onNewTaskTitleChange: (value: string) => void;
  onNewTaskDescriptionChange: (value: string) => void;
  onCreateTask: (e: React.FormEvent) => void;
  createTaskMutation: ReturnType<typeof useCreateTask>;
}

interface Column {
  id: TaskStatus;
  title: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

const columns: Column[] = [
  {
    id: TaskStatus.PENDING,
    title: 'Pendente',
    color: 'text-gray-800 dark:text-gray-200',
    bgColor: 'bg-gray-50 dark:bg-gray-800/50',
    borderColor: 'border-gray-300 dark:border-gray-600',
  },
  {
    id: TaskStatus.IN_PROGRESS,
    title: 'Em Progresso',
    color: 'text-yellow-800 dark:text-yellow-200',
    bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
    borderColor: 'border-yellow-300 dark:border-yellow-700',
  },
  {
    id: TaskStatus.COMPLETED,
    title: 'Concluída',
    color: 'text-green-800 dark:text-green-200',
    bgColor: 'bg-green-50 dark:bg-green-900/20',
    borderColor: 'border-green-300 dark:border-green-700',
  },
];

export default function KanbanBoard({
  tasks,
  onEditTask,
  onDeleteTask,
  editingTaskId,
  editTaskTitle,
  editTaskDescription,
  onEditTaskTitleChange,
  onEditTaskDescriptionChange,
  onCancelEdit,
  onSaveEdit,
  updateTaskMutation,
  deleteTaskMutation,
  newTaskTitle,
  newTaskDescription,
  onNewTaskTitleChange,
  onNewTaskDescriptionChange,
  onCreateTask,
  createTaskMutation,
}: KanbanBoardProps) {
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [draggedOverColumn, setDraggedOverColumn] = useState<TaskStatus | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Fechar formulário quando tarefa for criada com sucesso
  useEffect(() => {
    if (createTaskMutation.isSuccess && !createTaskMutation.isPending && !newTaskTitle && !newTaskDescription) {
      setShowCreateForm(false);
    }
  }, [createTaskMutation.isSuccess, createTaskMutation.isPending, newTaskTitle, newTaskDescription]);

  const handleCreateTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onCreateTask(e);
    // O formulário será fechado pelo useEffect quando os campos forem limpos
  };

  const handleDragStart = (e: React.DragEvent, task: Task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', task.id.toString());
  };

  const handleDragOver = (e: React.DragEvent, columnId: TaskStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDraggedOverColumn(columnId);
  };

  const handleDragLeave = () => {
    setDraggedOverColumn(null);
  };

  const handleDrop = async (e: React.DragEvent, columnId: TaskStatus) => {
    e.preventDefault();
    setDraggedOverColumn(null);

    if (!draggedTask || draggedTask.status === columnId) {
      setDraggedTask(null);
      return;
    }

    try {
      await updateTaskMutation.mutateAsync({
        id: draggedTask.id,
        data: { status: columnId },
      });
    } catch (error) {
      console.error('Erro ao mover tarefa:', error);
    } finally {
      setDraggedTask(null);
    }
  };

  const getTasksByStatus = (status: TaskStatus) => {
    return tasks.filter((task) => task.status === status);
  };

  return (
    <div className="space-y-4">
      {/* Formulário de criação de tarefa integrado */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border-2 border-gray-200 dark:border-gray-700">
        {!showCreateForm ? (
          <button
            onClick={() => setShowCreateForm(true)}
            className="w-full py-3 px-4 bg-indigo-600 dark:bg-indigo-700 text-white rounded-md hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors flex items-center justify-center space-x-2 font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Nova Tarefa</span>
          </button>
        ) : (
          <form onSubmit={handleCreateTaskSubmit} className="space-y-3">
            <div>
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => onNewTaskTitleChange(e.target.value)}
                placeholder="Título da tarefa"
                className="w-full px-3 py-2 border-2 border-gray-400 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                required
                autoFocus
              />
            </div>
            <div>
              <textarea
                value={newTaskDescription}
                onChange={(e) => onNewTaskDescriptionChange(e.target.value)}
                placeholder="Descrição (opcional)"
                rows={2}
                className="w-full px-3 py-2 border-2 border-gray-400 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              />
            </div>
            <div className="flex space-x-2">
              <button
                type="submit"
                disabled={createTaskMutation.isPending || !newTaskTitle.trim()}
                className="flex-1 px-4 py-2 bg-indigo-600 dark:bg-indigo-700 text-white rounded-md hover:bg-indigo-700 dark:hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transition-colors"
              >
                {createTaskMutation.isPending && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                <span>{createTaskMutation.isPending ? 'Criando...' : 'Criar'}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  onNewTaskTitleChange('');
                  onNewTaskDescriptionChange('');
                }}
                disabled={createTaskMutation.isPending}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Colunas do Kanban */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 overflow-x-auto pb-4">
      {columns.map((column) => {
        const columnTasks = getTasksByStatus(column.id);
        const isDraggedOver = draggedOverColumn === column.id;

        return (
          <div
            key={column.id}
            className={`flex flex-col h-full min-h-[500px] rounded-lg border-2 ${column.borderColor} ${column.bgColor} transition-all ${
              isDraggedOver ? 'ring-2 ring-indigo-500 ring-offset-2 scale-105 shadow-lg' : ''
            }`}
            onDragOver={(e) => handleDragOver(e, column.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            {/* Cabeçalho da coluna */}
            <div className={`p-4 border-b-2 ${column.borderColor} sticky top-0 z-10 ${column.bgColor}`}>
              <div className="flex items-center justify-between">
                <h3 className={`text-lg font-semibold ${column.color}`}>
                  {column.title}
                </h3>
                <span
                  className={`px-2 py-1 text-xs font-semibold rounded-full ${column.bgColor} ${column.color} border ${column.borderColor}`}
                >
                  {columnTasks.length}
                </span>
              </div>
            </div>

            {/* Tarefas da coluna */}
            <div className="flex-1 p-4 space-y-3 overflow-y-auto">
              {columnTasks.length === 0 ? (
                <div className={`text-center py-8 text-sm ${column.color} opacity-50`}>
                  Nenhuma tarefa
                </div>
              ) : (
                columnTasks.map((task) => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task)}
                    className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 cursor-move hover:shadow-lg transition-all transform hover:scale-105 ${
                      draggedTask?.id === task.id ? 'opacity-50 scale-95' : ''
                    }`}
                  >
                    {editingTaskId === task.id ? (
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={editTaskTitle}
                          onChange={(e) => onEditTaskTitleChange(e.target.value)}
                          className="w-full px-3 py-2 border-2 border-gray-400 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="Título da tarefa"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              onSaveEdit(task.id);
                            } else if (e.key === 'Escape') {
                              onCancelEdit();
                            }
                          }}
                        />
                        <textarea
                          value={editTaskDescription}
                          onChange={(e) => onEditTaskDescriptionChange(e.target.value)}
                          rows={3}
                          className="w-full px-3 py-2 border-2 border-gray-400 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="Descrição da tarefa"
                        />
                        <div className="flex space-x-2">
                          <button
                            onClick={() => onSaveEdit(task.id)}
                            disabled={updateTaskMutation.isPending || !editTaskTitle.trim()}
                            className="flex-1 px-3 py-2 bg-indigo-600 dark:bg-indigo-700 text-white rounded-md hover:bg-indigo-700 dark:hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                          >
                            Salvar
                          </button>
                          <button
                            onClick={onCancelEdit}
                            disabled={updateTaskMutation.isPending}
                            className="flex-1 px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <h4
                          className={`font-semibold mb-2 ${
                            task.status === TaskStatus.COMPLETED
                              ? 'line-through text-gray-500 dark:text-gray-400'
                              : 'text-gray-900 dark:text-white'
                          }`}
                        >
                          {task.title}
                        </h4>
                        {task.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-3">
                            {task.description}
                          </p>
                        )}
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(task.created_at).toLocaleDateString('pt-BR')}
                          </span>
                          <div className="flex space-x-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onEditTask(task);
                              }}
                              disabled={updateTaskMutation.isPending || deleteTaskMutation.isPending}
                              className="px-2 py-1 text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Editar"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteTask(task.id);
                              }}
                              disabled={deleteTaskMutation.isPending || updateTaskMutation.isPending}
                              className="px-2 py-1 text-xs text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Deletar"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
      </div>
    </div>
  );
}
