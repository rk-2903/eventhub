import { create } from 'zustand';
import { UserProfile } from '../types';
import { mockUsers } from '../utils/mockData';

interface UserProfileState {
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  fetchUserProfile: (userId: string) => Promise<void>;
  updateUserProfile: (userId: string, data: Partial<UserProfile>) => Promise<void>;
}

export const useUserProfileStore = create<UserProfileState>((set) => ({
  profile: null,
  isLoading: false,
  error: null,

  fetchUserProfile: async (userId: string) => {
    set({ isLoading: true, error: null });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const user = mockUsers.find(u => u.id === userId);
      if (!user) throw new Error('User not found');

      // Mock profile data
      const profile: UserProfile = {
        user: {
          ...user,
          phone: '+1 (555) 123-4567',
          address: '123 Main St, City, State 12345',
          joinDate: '2025-01-15',
        },
        enrollments: [],
        attendance: [],
        payments: [],
        stats: {
          totalEvents: 3,
          completedEvents: 1,
          upcomingEvents: 2,
          attendanceRate: 85,
        },
      };

      set({ profile, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch user profile',
        isLoading: false,
      });
    }
  },

  updateUserProfile: async (userId: string, data: Partial<UserProfile>) => {
    set({ isLoading: true, error: null });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      set(state => ({
        profile: state.profile ? { ...state.profile, ...data } : null,
        isLoading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update user profile',
        isLoading: false,
      });
    }
  },
}));