import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import { toast } from 'react-hot-toast';
import type { Goal } from '@growth-journal/types';

export function useGoals() {
  return useQuery({
    queryKey: ['goals'],
    queryFn: api.goals.getAll,
  });
}

export function useGoalStats() {
  return useQuery({
    queryKey: ['goals', 'stats'],
    queryFn: api.goals.getStats,
  });
}

export function useCreateGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (goal: Goal) => api.goals.create(goal),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      queryClient.invalidateQueries({ queryKey: ['achievements'] });
      toast.success('Goal created! 🎯');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create goal');
    },
  });
}

export function useUpdateGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Goal> }) =>
      api.goals.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      queryClient.invalidateQueries({ queryKey: ['achievements'] });
      toast.success('Goal updated');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update goal');
    },
  });
}

export function useDeleteGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => api.goals.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      toast.success('Goal deleted');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete goal');
    },
  });
}
