'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask, useAllTasks } from '@/lib/hooks/use-tasks';
import { useTheme } from '@/lib/hooks/use-theme';
import { useDebounce } from '@/lib/hooks/use-debounce';
import { TaskStatus, Task } from '@/types';
import { useState, useMemo } from 'react';
import KanbanBoard from '@/components/KanbanBoard';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import MessageAlert from '@/components/dashboard/MessageAlert';
import StatusCounters from '@/components/dashboard/StatusCounters';
import TaskForm from '@/components/dashboard/TaskForm';
import TaskList from '@/components/dashboard/TaskList';
import TaskSearch from '@/components/dashboard/TaskSearch';
import TaskPagination from '@/components/dashboard/TaskPagination';
import TaskSorting from '@/components/dashboard/TaskSorting';

export default function DashboardPage() {
  const router = useRouter();
  const { mounted } = useTheme();

  // Estados de filtros e paginação
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState<'created_at' | 'updated_at' | 'title' | 'status'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Debounce na busca para evitar requisições excessivas
  const debouncedSearch = useDebounce(search, 500);

  // Buscar todas as tarefas para cache e filtragem client-side
  const { data: allTasksData } = useAllTasks();
  const allTasksCache = allTasksData?.tasks || [];

  // Helper para verificar se é um filtro válido
  const isValidStatusFilter = (filter: TaskStatus | 'all'): filter is TaskStatus => {
    return filter !== 'all';
  };

  // Determinar se deve usar filtragem client-side ou server-side
  // Client-side: apenas filtro de status (sem busca, sem paginação complexa)
  const useClientSideFilter = !debouncedSearch && isValidStatusFilter(statusFilter) && page === 1;

  // Parâmetros de query para server-side
  const queryParams = useMemo(() => ({
    page,
    limit,
    search: debouncedSearch.trim() || undefined,
    status: isValidStatusFilter(statusFilter) ? statusFilter : undefined,
    sortBy,
    sortOrder,
  }), [page, limit, debouncedSearch, statusFilter, sortBy, sortOrder]);

  // Query server-side (usado quando há busca ou paginação)
  const { data, isLoading, error, isFetching } = useTasks(useClientSideFilter ? undefined : queryParams);

  // Filtragem client-side para melhor performance
  const clientSideFilteredTasks = useMemo(() => {
    if (!useClientSideFilter || allTasksCache.length === 0) return [];

    let filtered = [...allTasksCache];

    // Filtrar por status
    if (isValidStatusFilter(statusFilter)) {
      filtered = filtered.filter(task => task.status === statusFilter);
    }

    // Ordenar
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortBy) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'updated_at':
          aValue = new Date(a.updated_at).getTime();
          bValue = new Date(b.updated_at).getTime();
          break;
        default: // created_at
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      }
    });

    // Aplicar paginação
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    return filtered.slice(startIndex, endIndex);
  }, [useClientSideFilter, allTasksCache, statusFilter, sortBy, sortOrder, page, limit]);

  // Calcular paginação client-side
  const clientSidePagination = useMemo(() => {
    if (!useClientSideFilter || allTasksCache.length === 0) return null;

    let filtered = [...allTasksCache];
    if (isValidStatusFilter(statusFilter)) {
      filtered = filtered.filter(task => task.status === statusFilter);
    }

    const total = filtered.length;
    const totalPages = Math.ceil(total / limit);

    return {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };
  }, [useClientSideFilter, allTasksCache, statusFilter, page, limit]);

  // Decidir qual dados usar
  const tasks = useClientSideFilter ? clientSideFilteredTasks : (data?.tasks || []);
  const pagination = useClientSideFilter ? clientSidePagination : data?.pagination;
  const isLoadingTasks = useClientSideFilter ? false : isLoading;
  const isFetchingTasks = useClientSideFilter ? false : isFetching;
  const createTaskMutation = useCreateTask();
  const updateTaskMutation = useUpdateTask();
  const deleteTaskMutation = useDeleteTask();

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [editTaskTitle, setEditTaskTitle] = useState('');
  const [editTaskDescription, setEditTaskDescription] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');

  // Resetar página quando filtros mudarem (mas não na busca debounced)
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter, sortBy, sortOrder]);

  // Ajustar página quando limit mudar (se necessário)
  useEffect(() => {
    if (pagination && page > pagination.totalPages) {
      setPage(pagination.totalPages || 1);
    }
  }, [limit, pagination, page]);

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

  if (!mounted) {
    return null; // Evitar flash de conteúdo incorreto
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <DashboardHeader viewMode={viewMode} onViewModeChange={setViewMode} />

        <MessageAlert message={successMessage} type="success" />
        <MessageAlert message={errorMessage} type="error" />

        <StatusCounters 
          tasks={allTasksCache.length > 0 ? allTasksCache : tasks} 
          onFilterChange={setStatusFilter} 
          isLoading={isFetchingTasks} 
        />

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
          <>
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 transition-colors">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                Suas Tarefas ({pagination?.total || tasks.length})
              </h2>
              <KanbanBoard
                tasks={tasks}
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
            {pagination && (
              <TaskPagination
                page={pagination.page}
                totalPages={pagination.totalPages}
                hasNextPage={pagination.hasNextPage}
                hasPrevPage={pagination.hasPrevPage}
                onPageChange={setPage}
                limit={limit}
                onLimitChange={setLimit}
                total={pagination.total}
              />
            )}
          </>
        ) : (
          <>
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 transition-colors mb-4">
              <TaskSearch 
                search={search} 
                onSearchChange={setSearch} 
                isLoading={isFetchingTasks && !useClientSideFilter} 
              />
              <TaskSorting
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSortChange={(newSortBy, newSortOrder) => {
                  setSortBy(newSortBy);
                  setSortOrder(newSortOrder);
                }}
                isLoading={isFetchingTasks && !useClientSideFilter}
              />
            </div>
            <div className="relative">
              {/* Indicador sutil de loading durante fetch em background */}
              {isFetchingTasks && !useClientSideFilter && tasks.length > 0 && (
                <div className="absolute top-0 right-0 z-10 bg-indigo-100 dark:bg-indigo-900/30 px-3 py-1 rounded-bl-lg rounded-tr-lg">
                  <div className="flex items-center space-x-2 text-xs text-indigo-700 dark:text-indigo-300">
                    <svg
                      className="animate-spin h-3 w-3"
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
                    <span>Atualizando...</span>
                  </div>
                </div>
              )}
              <TaskList
                allTasks={tasks}
                filteredTasks={tasks}
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
                isLoading={isFetchingTasks && !useClientSideFilter && tasks.length === 0}
              />
            </div>
            {pagination && (
              <TaskPagination
                page={pagination.page}
                totalPages={pagination.totalPages}
                hasNextPage={pagination.hasNextPage}
                hasPrevPage={pagination.hasPrevPage}
                onPageChange={setPage}
                limit={limit}
                onLimitChange={setLimit}
                total={pagination.total}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
