'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask } from '@/lib/hooks/use-tasks';
import { useTheme } from '@/lib/hooks/use-theme';
import { TaskStatus, Task } from '@/types';
import { useState } from 'react';
import KanbanBoard from '@/components/KanbanBoard';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import MessageAlert from '@/components/dashboard/MessageAlert';
import StatusCounters from '@/components/dashboard/StatusCounters';
import TaskForm from '@/components/dashboard/TaskForm';
import TaskList from '@/components/dashboard/TaskList';

export default function DashboardPage() {
  const router = useRouter();
  const { data, isLoading, error } = useTasks();
  const createTaskMutation = useCreateTask();
  const updateTaskMutation = useUpdateTask();
  const deleteTaskMutation = useDeleteTask();
  const { mounted } = useTheme();

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

  if (!mounted) {
    return null; // Evitar flash de conteúdo incorreto
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <DashboardHeader viewMode={viewMode} onViewModeChange={setViewMode} />

        <MessageAlert message={successMessage} type="success" />
        <MessageAlert message={errorMessage} type="error" />

        <StatusCounters tasks={allTasks} onFilterChange={setStatusFilter} />

        {viewMode === 'list' && (
          <TaskForm
            title={newTaskTitle}
            description={newTaskDescription}
            onTitleChange={setNewTaskTitle}
            onDescriptionChange={setNewTaskDescription}
            onSubmit={handleCreateTask}
          />
        )}

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
          <TaskList
            allTasks={allTasks}
            filteredTasks={filteredTasks}
            statusFilter={statusFilter}
            onFilterChange={setStatusFilter}
            editingTaskId={editingTaskId}
            editTaskTitle={editTaskTitle}
            editTaskDescription={editTaskDescription}
            onEditTaskTitleChange={setEditTaskTitle}
            onEditTaskDescriptionChange={setEditTaskDescription}
            onStartEdit={handleEditTask}
            onCancelEdit={handleCancelEdit}
            onSaveEdit={handleSaveEdit}
            onToggleTask={handleToggleTask}
            onChangeStatus={handleChangeStatus}
            onDeleteTask={handleDeleteTask}
          />
        )}
      </div>
    </div>
  );
}
