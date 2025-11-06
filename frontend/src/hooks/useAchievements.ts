import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import { toast } from 'react-hot-toast';

export function useAchievements() {
  return useQuery({
    queryKey: ['achievements'],
    queryFn: api.achievements.getAll,
  });
}

export function useAchievementStats() {
  return useQuery({
    queryKey: ['achievements', 'stats'],
    queryFn: api.achievements.getStats,
  });
}

export function useCheckAchievements() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => api.achievements.check(),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['achievements'] });

      // Show toast for each unlocked achievement
      data.unlocked.forEach((achievement: any) => {
        toast.success(
          `🏆 Achievement Unlocked: ${achievement.name}!`,
          { duration: 5000 }
        );
      });
    },
  });
}
