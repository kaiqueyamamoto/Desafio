'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask } from '@/lib/hooks/use-tasks';
import { useLogout } from '@/lib/hooks/use-auth';
import { TaskStatus, Task } from '@/types';
import { useState } from 'react';

export default function DashboardPage() {
  const router = useRouter();
  const { data, isLoading, error } = useTasks();
  const createTaskMutation = useCreateTask();
  const updateTaskMutation = useUpdateTask();
  const deleteTaskMutation = useDeleteTask();
  const logout = useLogout();

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [editTaskTitle, setEditTaskTitle] = useState('');
  const [editTaskDescription, setEditTaskDescription] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      router.push('/login?redirect=/dashboard');
    }
  }, [router]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

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
      console.error('Erro ao criar tarefa:', error);
    }
  };

  const handleToggleTask = async (task: Task) => {
    const newStatus =
      task.status === TaskStatus.COMPLETED
        ? TaskStatus.PENDING
        : TaskStatus.COMPLETED;

    try {
      await updateTaskMutation.mutateAsync({
        id: task.id,
        data: { status: newStatus },
      });
      setSuccessMessage('Status da tarefa atualizado com sucesso!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error);
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
      console.error('Erro ao editar tarefa:', error);
    }
  };

  const handleDeleteTask = async (id: number) => {
    if (!confirm('Tem certeza que deseja deletar esta tarefa?')) return;

    try {
      await deleteTaskMutation.mutateAsync(id);
      setSuccessMessage('Tarefa deletada com sucesso!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Erro ao deletar tarefa:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Carregando tarefas...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-600">
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <button
            onClick={logout}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Sair
          </button>
        </div>

        {/* Mensagem de sucesso */}
        {successMessage && (
          <div className="mb-4 rounded-md bg-green-50 p-4 border border-green-200">
            <p className="text-sm text-green-800">{successMessage}</p>
          </div>
        )}

        {/* Formulário de nova tarefa */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Nova Tarefa</h2>
          <form onSubmit={handleCreateTask} className="space-y-4">
            <div>
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="Título da tarefa"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <textarea
                value={newTaskDescription}
                onChange={(e) => setNewTaskDescription(e.target.value)}
                placeholder="Descrição (opcional)"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <button
              type="submit"
              disabled={createTaskMutation.isPending}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {createTaskMutation.isPending ? 'Criando...' : 'Criar Tarefa'}
            </button>
          </form>
        </div>

        {/* Lista de tarefas */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                Suas Tarefas ({filteredTasks.length} de {allTasks.length})
              </h2>
            </div>
            {/* Filtro por status */}
            <div className="flex space-x-2">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  statusFilter === 'all'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Todas
              </button>
              <button
                onClick={() => setStatusFilter(TaskStatus.PENDING)}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  statusFilter === TaskStatus.PENDING
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Pendentes
              </button>
              <button
                onClick={() => setStatusFilter(TaskStatus.IN_PROGRESS)}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  statusFilter === TaskStatus.IN_PROGRESS
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Em Progresso
              </button>
              <button
                onClick={() => setStatusFilter(TaskStatus.COMPLETED)}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  statusFilter === TaskStatus.COMPLETED
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Concluídas
              </button>
            </div>
          </div>
          {filteredTasks.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
              {allTasks.length === 0
                ? 'Nenhuma tarefa criada ainda. Crie sua primeira tarefa acima!'
                : `Nenhuma tarefa com status "${statusFilter === 'all' ? 'todas' : statusFilter === TaskStatus.PENDING ? 'pendente' : statusFilter === TaskStatus.IN_PROGRESS ? 'em progresso' : 'concluída'}" encontrada.`}
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {filteredTasks.map((task) => (
                <li key={task.id} className="px-6 py-4 hover:bg-gray-50">
                  {editingTaskId === task.id ? (
                    <div className="space-y-4">
                      <div>
                        <input
                          type="text"
                          value={editTaskTitle}
                          onChange={(e) => setEditTaskTitle(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="Título da tarefa"
                        />
                      </div>
                      <div>
                        <textarea
                          value={editTaskDescription}
                          onChange={(e) => setEditTaskDescription(e.target.value)}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="Descrição (opcional)"
                        />
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleSaveEdit(task.id)}
                          disabled={updateTaskMutation.isPending || !editTaskTitle.trim()}
                          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {updateTaskMutation.isPending ? 'Salvando...' : 'Salvar'}
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          disabled={updateTaskMutation.isPending}
                          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={task.status === TaskStatus.COMPLETED}
                            onChange={() => handleToggleTask(task)}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          />
                          <h3
                            className={`text-lg font-medium ${
                              task.status === TaskStatus.COMPLETED
                                ? 'line-through text-gray-500'
                                : 'text-gray-900'
                            }`}
                          >
                            {task.title}
                          </h3>
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded ${
                              task.status === TaskStatus.COMPLETED
                                ? 'bg-green-100 text-green-800'
                                : task.status === TaskStatus.IN_PROGRESS
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {task.status === TaskStatus.COMPLETED
                              ? 'Concluída'
                              : task.status === TaskStatus.IN_PROGRESS
                              ? 'Em Progresso'
                              : 'Pendente'}
                          </span>
                        </div>
                        {task.description && (
                          <p className="mt-2 text-sm text-gray-600">{task.description}</p>
                        )}
                        <p className="mt-2 text-xs text-gray-500">
                          Criada em:{' '}
                          {new Date(task.created_at).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <div className="flex space-x-2 ml-4">
                        <button
                          onClick={() => handleEditTask(task)}
                          disabled={updateTaskMutation.isPending || deleteTaskMutation.isPending}
                          className="px-3 py-1 text-sm text-indigo-600 hover:text-indigo-800 disabled:opacity-50"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          disabled={deleteTaskMutation.isPending || updateTaskMutation.isPending}
                          className="px-3 py-1 text-sm text-red-600 hover:text-red-800 disabled:opacity-50"
                        >
                          Deletar
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
