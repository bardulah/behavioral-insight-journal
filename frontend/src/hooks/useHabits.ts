import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import { toast } from 'react-hot-toast';
import type { Habit } from '@growth-journal/types';

export function useHabits() {
  return useQuery({
    queryKey: ['habits'],
    queryFn: api.habits.getAll,
  });
}

export function useHabitStats() {
  return useQuery({
    queryKey: ['habits', 'today-stats'],
    queryFn: api.habits.getTodayStats,
    refetchInterval: 60000, // Refetch every minute
  });
}

export function useCreateHabit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (habit: Habit) => api.habits.create(habit),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      queryClient.invalidateQueries({ queryKey: ['achievements'] });
      toast.success('Habit created! 🌱');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create habit');
    },
  });
}

export function useCompleteHabit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, note }: { id: number; note?: string }) =>
      api.habits.complete(id, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      queryClient.invalidateQueries({ queryKey: ['achievements'] });
      toast.success('Great job! Keep it up! 🎉', { icon: '✅' });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to log completion');
    },
  });
}

export function useDeleteHabit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => api.habits.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      toast.success('Habit deleted');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete habit');
    },
  });
}
