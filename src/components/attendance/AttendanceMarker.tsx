import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAttendanceStore } from '../../store/attendanceStore';
import { Attendance } from '../../types';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { Check, Clock, X } from 'lucide-react';

interface AttendanceMarkerProps {
  eventId: string;
  batchId: string;
  userId: string;
  date: string;
  existingAttendance?: Attendance;
  onMarked?: () => void;
}

const AttendanceMarker: React.FC<AttendanceMarkerProps> = ({
  eventId,
  batchId,
  userId,
  date,
  existingAttendance,
  onMarked,
}) => {
  const { markAttendance, updateAttendance, isLoading } = useAttendanceStore();
  const [notes, setNotes] = useState(existingAttendance?.notes || '');

  const handleMarkAttendance = async (status: 'present' | 'absent' | 'late') => {
    try {
      if (existingAttendance) {
        await updateAttendance(existingAttendance.id, status, notes);
      } else {
        await markAttendance({
          userId,
          eventId,
          batchId,
          date,
          status,
          notes: notes.trim() || undefined,
        });
      }
      onMarked?.();
    } catch (error) {
      console.error('Failed to mark attendance:', error);
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-sm">
      <div className="space-y-4">
        <div className="flex space-x-2">
          <Button
            variant={existingAttendance?.status === 'present' ? 'success' : 'outline'}
            onClick={() => handleMarkAttendance('present')}
            leftIcon={<Check className="h-4 w-4" />}
            isLoading={isLoading}
            size="sm"
          >
            Present
          </Button>
          <Button
            variant={existingAttendance?.status === 'absent' ? 'danger' : 'outline'}
            onClick={() => handleMarkAttendance('absent')}
            leftIcon={<X className="h-4 w-4" />}
            isLoading={isLoading}
            size="sm"
          >
            Absent
          </Button>
          <Button
            variant={existingAttendance?.status === 'late' ? 'warning' : 'outline'}
            onClick={() => handleMarkAttendance('late')}
            leftIcon={<Clock className="h-4 w-4" />}
            isLoading={isLoading}
            size="sm"
          >
            Late
          </Button>
        </div>
        
        <Input
          placeholder="Add notes (optional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          fullWidth
        />
      </div>
    </div>
  );
};

export default AttendanceMarker;