import { create } from 'zustand';
import { Attendance } from '../types';
import { format } from 'date-fns';

interface AttendanceState {
  attendanceRecords: Attendance[];
  isLoading: boolean;
  error: string | null;
  fetchAttendance: (eventId: string, batchId: string) => Promise<void>;
  markAttendance: (attendance: Omit<Attendance, 'id'>) => Promise<void>;
  updateAttendance: (attendanceId: string, status: 'present' | 'absent' | 'late', notes?: string) => Promise<void>;
  getUserAttendance: (userId: string, eventId: string) => Promise<Attendance[]>;
}

// Mock attendance data
const mockAttendance: Attendance[] = [
  {
    id: '1',
    userId: '1',
    eventId: '1',
    batchId: '1-1',
    date: format(new Date(2025, 5, 15), 'yyyy-MM-dd'),
    status: 'present',
  },
  {
    id: '2',
    userId: '1',
    eventId: '1',
    batchId: '1-1',
    date: format(new Date(2025, 5, 16), 'yyyy-MM-dd'),
    status: 'late',
    notes: 'Arrived 15 minutes late',
  },
];

export const useAttendanceStore = create<AttendanceState>((set, get) => ({
  attendanceRecords: [],
  isLoading: false,
  error: null,

  fetchAttendance: async (eventId: string, batchId: string) => {
    set({ isLoading: true, error: null });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      const records = mockAttendance.filter(
        record => record.eventId === eventId && record.batchId === batchId
      );
      set({ attendanceRecords: records, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch attendance',
        isLoading: false,
      });
    }
  },

  markAttendance: async (attendance) => {
    set({ isLoading: true, error: null });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      const newAttendance: Attendance = {
        ...attendance,
        id: `${Math.random().toString(36).substr(2, 9)}`,
      };
      set(state => ({
        attendanceRecords: [...state.attendanceRecords, newAttendance],
        isLoading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to mark attendance',
        isLoading: false,
      });
    }
  },

  updateAttendance: async (attendanceId, status, notes) => {
    set({ isLoading: true, error: null });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      set(state => ({
        attendanceRecords: state.attendanceRecords.map(record =>
          record.id === attendanceId ? { ...record, status, notes } : record
        ),
        isLoading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update attendance',
        isLoading: false,
      });
    }
  },

  getUserAttendance: async (userId: string, eventId: string) => {
    set({ isLoading: true, error: null });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      const records = mockAttendance.filter(
        record => record.userId === userId && record.eventId === eventId
      );
      return records;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch user attendance',
        isLoading: false,
      });
      return [];
    } finally {
      set({ isLoading: false });
    }
  },
}));