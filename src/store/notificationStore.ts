import { create } from 'zustand';
import { Notification } from '../types';
import { mockNotifications } from '../utils/mockData';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  fetchNotifications: (userId: string) => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
  
  fetchNotifications: async (userId: string) => {
    set({ isLoading: true, error: null });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const userNotifications = mockNotifications.filter(notification => notification.userId === userId);
      const unreadCount = userNotifications.filter(notification => !notification.read).length;
      
      set({ 
        notifications: userNotifications, 
        unreadCount,
        isLoading: false 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'An unknown error occurred', 
        isLoading: false 
      });
    }
  },
  
  markAsRead: async (notificationId: string) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      set(state => {
        const updatedNotifications = state.notifications.map(notification => 
          notification.id === notificationId 
            ? { ...notification, read: true } 
            : notification
        );
        
        const unreadCount = updatedNotifications.filter(notification => !notification.read).length;
        
        return { 
          notifications: updatedNotifications,
          unreadCount
        };
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'An unknown error occurred'
      });
    }
  },
  
  markAllAsRead: async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      set(state => ({
        notifications: state.notifications.map(notification => ({ ...notification, read: true })),
        unreadCount: 0
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'An unknown error occurred'
      });
    }
  }
}));