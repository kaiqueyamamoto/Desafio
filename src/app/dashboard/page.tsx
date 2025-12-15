'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask } from '@/lib/hooks/use-tasks';
import { useLogout } from '@/lib/hooks/use-auth';
import { useTheme } from '@/lib/hooks/use-theme';
import { TaskStatus, Task } from '@/types';
import { useState } from 'react';
import KanbanBoard from '@/components/KanbanBoard';

export default function DashboardPage() {
  const router = useRouter();
  const { data, isLoading, error } = useTasks();
  const createTaskMutation = useCreateTask();
  const updateTaskMutation = useUpdateTask();
  const deleteTaskMutation = useDeleteTask();
  const logout = useLogout();
  const { theme, toggleTheme, mounted } = useTheme();

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [editTaskTitle, setEditTaskTitle] = useState('');
  const [editTaskDescription, setEditTaskDescription] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');

  // Função helper para extrair mensagem de erro
  const getErrorMessage = (error: unknown): string => {
    if (error instanceof Error) {
      return error.message;
    }
    if (typeof error === 'object' && error !== null && 'message' in error) {
      return String(error.message);
    }
    return 'Ocorreu um erro inesperado. Por favor, tente novamente.';
  };

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      router.push('/login?redirect=/dashboard');
    }
  }, [router]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    setErrorMessage(null);
    try {
      await createTaskMutation.mutateAsync({
        title: newTaskTitle,
        description: newTaskDescription || undefined,
      });
      setNewTaskTitle('');
      setNewTaskDescription('');
      setSuccessMessage('Tarefa criada com sucesso!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      const message = getErrorMessage(error);
      setErrorMessage(`Erro ao criar tarefa: ${message}`);
      setTimeout(() => setErrorMessage(null), 5000);
    }
  };

  const handleToggleTask = async (task: Task) => {
    const newStatus =
      task.status === TaskStatus.COMPLETED
        ? TaskStatus.PENDING
        : TaskStatus.COMPLETED;

    setErrorMessage(null);
    try {
      await updateTaskMutation.mutateAsync({
        id: task.id,
        data: { status: newStatus },
      });
      setSuccessMessage('Status da tarefa atualizado com sucesso!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      const message = getErrorMessage(error);
      setErrorMessage(`Erro ao atualizar tarefa: ${message}`);
      setTimeout(() => setErrorMessage(null), 5000);
    }
  };

  const handleChangeStatus = async (taskId: number, newStatus: TaskStatus) => {
    setErrorMessage(null);
    try {
      await updateTaskMutation.mutateAsync({
        id: taskId,
        data: { status: newStatus },
      });
      setSuccessMessage('Status da tarefa atualizado com sucesso!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      const message = getErrorMessage(error);
      setErrorMessage(`Erro ao atualizar tarefa: ${message}`);
      setTimeout(() => setErrorMessage(null), 5000);
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTaskId(task.id);
    setEditTaskTitle(task.title);
    setEditTaskDescription(task.description || '');
  };

  const handleCancelEdit = () => {
    setEditingTaskId(null);
    setEditTaskTitle('');
    setEditTaskDescription('');
  };

  const handleSaveEdit = async (taskId: number) => {
    if (!editTaskTitle.trim()) return;

    setErrorMessage(null);
    try {
      await updateTaskMutation.mutateAsync({
        id: taskId,
        data: {
          title: editTaskTitle,
          description: editTaskDescription || undefined,
        },
      });
      setEditingTaskId(null);
      setEditTaskTitle('');
      setEditTaskDescription('');
      setSuccessMessage('Tarefa editada com sucesso!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      const message = getErrorMessage(error);
      setErrorMessage(`Erro ao editar tarefa: ${message}`);
      setTimeout(() => setErrorMessage(null), 5000);
    }
  };

  const handleDeleteTask = async (id: number) => {
    if (!confirm('Tem certeza que deseja deletar esta tarefa?')) return;

    setErrorMessage(null);
    try {
      await deleteTaskMutation.mutateAsync(id);
      setSuccessMessage('Tarefa deletada com sucesso!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      const message = getErrorMessage(error);
      setErrorMessage(`Erro ao deletar tarefa: ${message}`);
      setTimeout(() => setErrorMessage(null), 5000);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <div className="text-gray-600 dark:text-gray-400 font-medium">Carregando tarefas...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-red-600 dark:text-red-400">
          Erro ao carregar tarefas. Por favor, faça login novamente.
        </div>
      </div>
    );
  }

  const allTasks = data?.tasks || [];
  const filteredTasks =
    statusFilter === 'all'
      ? allTasks
      : allTasks.filter((task) => task.status === statusFilter);

  // Contadores por status
  const pendingCount = allTasks.filter((task) => task.status === TaskStatus.PENDING).length;
  const inProgressCount = allTasks.filter((task) => task.status === TaskStatus.IN_PROGRESS).length;
  const completedCount = allTasks.filter((task) => task.status === TaskStatus.COMPLETED).length;

  if (!mounted) {
    return null; // Evitar flash de conteúdo incorreto
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <div className="flex items-center space-x-3">
            {/* Toggle de visualização Lista/Kanban */}
            <div className="flex items-center space-x-2 bg-gray-200 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
                title="Visualização em Lista"
              >
                <div className="flex items-center space-x-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                  <span>Lista</span>
                </div>
              </button>
              <button
                onClick={() => setViewMode('kanban')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'kanban'
                    ? 'bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
                title="Visualização Kanban"
              >
                <div className="flex items-center space-x-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                  </svg>
                  <span>Kanban</span>
                </div>
              </button>
            </div>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              aria-label="Alternar tema"
            >
              {theme === 'dark' ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
          <button
            onClick={logout}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 transition-colors"
          >
            Sair
          </button>
          </div>
        </div>

        {/* Mensagem de sucesso */}
        {successMessage && (
          <div className="mb-4 rounded-md bg-green-50 dark:bg-green-900/30 p-4 border border-green-200 dark:border-green-800">
            <p className="text-sm text-green-800 dark:text-green-200">{successMessage}</p>
          </div>
        )}

        {/* Mensagem de erro */}
        {errorMessage && (
          <div className="mb-4 rounded-md bg-red-50 dark:bg-red-900/30 p-4 border border-red-200 dark:border-red-800">
            <p className="text-sm text-red-800 dark:text-red-200">{errorMessage}</p>
          </div>
        )}

        {/* Contadores de Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pendentes</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{pendingCount}</p>
              </div>
              <button
                onClick={() => setStatusFilter(TaskStatus.PENDING)}
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
                onClick={() => setStatusFilter(TaskStatus.IN_PROGRESS)}
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
                onClick={() => setStatusFilter(TaskStatus.COMPLETED)}
                className="px-3 py-1 text-xs font-medium text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/30 rounded-md hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
              >
                Ver todas
              </button>
            </div>
          </div>
        </div>

        {/* Formulário de nova tarefa - apenas no modo lista */}
        {viewMode === 'list' && (
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6 transition-colors">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Nova Tarefa</h2>
            <form onSubmit={handleCreateTask} className="space-y-4">
            <div>
              <label htmlFor="task-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Título da tarefa
              </label>
              <input
                id="task-title"
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
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
                value={newTaskDescription}
                onChange={(e) => setNewTaskDescription(e.target.value)}
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
        )}

        {/* Lista de tarefas ou Kanban */}
        {viewMode === 'kanban' ? (
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 transition-colors">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              Suas Tarefas ({allTasks.length})
            </h2>
            <KanbanBoard
              tasks={allTasks}
              onEditTask={handleEditTask}
              onDeleteTask={handleDeleteTask}
              editingTaskId={editingTaskId}
              editTaskTitle={editTaskTitle}
              editTaskDescription={editTaskDescription}
              onEditTaskTitleChange={setEditTaskTitle}
              onEditTaskDescriptionChange={setEditTaskDescription}
              onCancelEdit={handleCancelEdit}
              onSaveEdit={handleSaveEdit}
              updateTaskMutation={updateTaskMutation}
              deleteTaskMutation={deleteTaskMutation}
              newTaskTitle={newTaskTitle}
              newTaskDescription={newTaskDescription}
              onNewTaskTitleChange={setNewTaskTitle}
              onNewTaskDescriptionChange={setNewTaskDescription}
              onCreateTask={handleCreateTask}
              createTaskMutation={createTaskMutation}
            />
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden transition-colors">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Suas Tarefas ({filteredTasks.length} de {allTasks.length})
              </h2>
            </div>
            {/* Filtro por status */}
            <div className="flex space-x-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setStatusFilter('all');
                }}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  statusFilter === 'all'
                    ? 'bg-indigo-600 dark:bg-indigo-700 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600'
                }`}
              >
                Todas
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setStatusFilter(TaskStatus.PENDING);
                }}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  statusFilter === TaskStatus.PENDING
                    ? 'bg-indigo-600 dark:bg-indigo-700 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600'
                }`}
              >
                Pendentes
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setStatusFilter(TaskStatus.IN_PROGRESS);
                }}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  statusFilter === TaskStatus.IN_PROGRESS
                    ? 'bg-indigo-600 dark:bg-indigo-700 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600'
                }`}
              >
                Em Progresso
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setStatusFilter(TaskStatus.COMPLETED);
                }}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  statusFilter === TaskStatus.COMPLETED
                    ? 'bg-indigo-600 dark:bg-indigo-700 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600'
                }`}
              >
                Concluídas
              </button>
            </div>
          </div>
          {filteredTasks.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-700 dark:text-gray-400">
              {allTasks.length === 0
                ? 'Nenhuma tarefa criada ainda. Crie sua primeira tarefa acima!'
                : `Nenhuma tarefa com status "${statusFilter === 'all' ? 'todas' : statusFilter === TaskStatus.PENDING ? 'pendente' : statusFilter === TaskStatus.IN_PROGRESS ? 'em progresso' : 'concluída'}" encontrada.`}
            </div>
          ) : (
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredTasks.map((task) => (
                <li key={task.id} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  {editingTaskId === task.id ? (
                    <div className="space-y-4">
                      <div>
                        <label htmlFor={`edit-title-${task.id}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Título da tarefa
                        </label>
                        <input
                          id={`edit-title-${task.id}`}
                          type="text"
                          value={editTaskTitle}
                          onChange={(e) => setEditTaskTitle(e.target.value)}
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
                          value={editTaskDescription}
                          onChange={(e) => setEditTaskDescription(e.target.value)}
                          rows={3}
                          className="w-full px-3 py-2 border-2 border-gray-400 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                          placeholder="Digite a descrição da tarefa"
                        />
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleSaveEdit(task.id)}
                          disabled={updateTaskMutation.isPending || !editTaskTitle.trim()}
                          className="px-4 py-2 bg-indigo-600 dark:bg-indigo-700 text-white rounded-md hover:bg-indigo-700 dark:hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-colors"
                        >
                          {updateTaskMutation.isPending && (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          )}
                          <span>{updateTaskMutation.isPending ? 'Salvando...' : 'Salvar'}</span>
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          disabled={updateTaskMutation.isPending}
                          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
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
                                handleToggleTask(task);
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
                                handleChangeStatus(task.id, TaskStatus.PENDING);
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
                                handleChangeStatus(task.id, TaskStatus.IN_PROGRESS);
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
                                handleChangeStatus(task.id, TaskStatus.COMPLETED);
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
                            handleEditTask(task);
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
                            handleDeleteTask(task.id);
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
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
        )}
      </div>
    </div>
  );
}
