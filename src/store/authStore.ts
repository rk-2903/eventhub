import { create } from 'zustand';
import { User } from '../types';
import { mockUsers } from '../utils/mockData';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  resetPassword: (email: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  
  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Find user in mock data
      const user = mockUsers.find(user => user.email === email);
      
      if (user && password === 'password') { // For demo purposes only
        set({ user, isAuthenticated: true, isLoading: false });
      } else {
        throw new Error('Invalid email or password');
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'An unknown error occurred', 
        isLoading: false 
      });
    }
  },
  
  register: async (name: string, email: string, password: string) => {
    set({ isLoading: true, error: null });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if email already exists
      const existingUser = mockUsers.find(user => user.email === email);
      
      if (existingUser) {
        throw new Error('Email already in use');
      }
      
      // For demo purposes, we're not actually adding to the mock data
      // In a real app, this would call an API to create the user
      set({ 
        user: {
          id: `${mockUsers.length + 1}`,
          name,
          email,
          role: 'user'
        }, 
        isAuthenticated: true, 
        isLoading: false 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'An unknown error occurred', 
        isLoading: false 
      });
    }
  },
  
  logout: () => {
    set({ user: null, isAuthenticated: false });
  },
  
  resetPassword: async (email: string) => {
    set({ isLoading: true, error: null });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if email exists
      const user = mockUsers.find(user => user.email === email);
      
      if (!user) {
        throw new Error('Email not found');
      }
      
      // In a real app, this would send a password reset email
      set({ isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'An unknown error occurred', 
        isLoading: false 
      });
    }
  }
}));