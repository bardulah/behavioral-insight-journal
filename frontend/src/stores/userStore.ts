import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserState {
  onboardingCompleted: boolean;
  firstJournalEntry: boolean;
  firstGoalCreated: boolean;
  firstHabitCreated: boolean;
  insightsGenerated: boolean;
  completeOnboarding: () => void;
  markFirstJournal: () => void;
  markFirstGoal: () => void;
  markFirstHabit: () => void;
  markInsightsGenerated: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      onboardingCompleted: false,
      firstJournalEntry: false,
      firstGoalCreated: false,
      firstHabitCreated: false,
      insightsGenerated: false,
      completeOnboarding: () => set({ onboardingCompleted: true }),
      markFirstJournal: () => set({ firstJournalEntry: true }),
      markFirstGoal: () => set({ firstGoalCreated: true }),
      markFirstHabit: () => set({ firstHabitCreated: true }),
      markInsightsGenerated: () => set({ insightsGenerated: true }),
    }),
    {
      name: 'user-progress',
    }
  )
);
