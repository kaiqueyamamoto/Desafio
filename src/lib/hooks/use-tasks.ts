import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTasks, createTask, updateTask, deleteTask, TasksQueryParams } from '@/lib/api/tasks';
import { CreateTaskDto, UpdateTaskDto } from '@/types';

export function useTasks(params?: TasksQueryParams) {
  return useQuery({
    queryKey: ['tasks', params],
    queryFn: () => getTasks(params),
    // Manter dados anteriores durante o loading para transição suave
    placeholderData: (previousData) => previousData,
    // Stale time de 30 segundos para evitar refetch desnecessário
    staleTime: 30000,
    // Cache time de 5 minutos
    gcTime: 300000,
    // Refetch apenas quando a janela ganha foco (não em cada mudança)
    refetchOnWindowFocus: false,
    // Não refetch automaticamente em background
    refetchOnMount: false,
  });
}

// Hook para buscar todas as tarefas (sem filtros) para cache
export function useAllTasks() {
  return useQuery({
    queryKey: ['tasks', 'all'],
    queryFn: () => getTasks({ limit: 1000 }), // Buscar muitas tarefas para cache
    staleTime: 60000, // 1 minuto
    gcTime: 300000,
    refetchOnWindowFocus: false,
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTaskDto) => createTask(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateTaskDto }) =>
      updateTask(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}
