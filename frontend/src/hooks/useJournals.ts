import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import { toast } from 'react-hot-toast';
import type { JournalEntry } from '@growth-journal/types';

export function useJournals() {
  return useQuery({
    queryKey: ['journals'],
    queryFn: api.journals.getAll,
  });
}

export function useJournalStats() {
  return useQuery({
    queryKey: ['journals', 'stats'],
    queryFn: api.journals.getStats,
  });
}

export function useMoodTrend(days: number = 30) {
  return useQuery({
    queryKey: ['journals', 'mood-trend', days],
    queryFn: () => api.journals.getMoodTrend(days),
  });
}

export function useCreateJournal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (entry: JournalEntry) => api.journals.create(entry),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journals'] });
      queryClient.invalidateQueries({ queryKey: ['achievements'] });
      toast.success('Journal entry created! ✍️');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create entry');
    },
  });
}

export function useUpdateJournal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<JournalEntry> }) =>
      api.journals.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journals'] });
      toast.success('Entry updated');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update entry');
    },
  });
}

export function useDeleteJournal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => api.journals.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journals'] });
      toast.success('Entry deleted');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete entry');
    },
  });
}
