import React from 'react';
import CalendarHeatmap from 'react-calendar-heatmap';
import { format, subDays } from 'date-fns';
import { Attendance } from '../../types';
import Card from '../ui/Card';
import 'react-calendar-heatmap/dist/styles.css';

interface AttendanceHeatmapProps {
  attendance: Attendance[];
}

const AttendanceHeatmap: React.FC<AttendanceHeatmapProps> = ({ attendance }) => {
  const today = new Date();
  const startDate = subDays(today, 365);

  const getColor = (value: { count: number }) => {
    if (!value) return 'color-empty';
    return `color-scale-${Math.min(value.count, 4)}`;
  };

  const values = attendance.map(record => ({
    date: record.date,
    count: record.status === 'present' ? 1 : record.status === 'late' ? 0.5 : 0,
  }));

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Attendance History</h3>
      <div className="attendance-heatmap">
        <CalendarHeatmap
          startDate={startDate}
          endDate={today}
          values={values}
          classForValue={getColor}
          titleForValue={(value) => {
            if (!value) return 'No attendance';
            return `${format(new Date(value.date), 'MMM dd, yyyy')}: ${
              value.count === 1 ? 'Present' : value.count === 0.5 ? 'Late' : 'Absent'
            }`;
          }}
        />
      </div>
      <style>{`
        .attendance-heatmap .color-empty { fill: #ebedf0; }
        .attendance-heatmap .color-scale-0 { fill: #ff4d4d; }
        .attendance-heatmap .color-scale-1 { fill: #7bc96f; }
        .attendance-heatmap .color-scale-2 { fill: #196127; }
        .attendance-heatmap .color-scale-3 { fill: #196127; }
        .attendance-heatmap .color-scale-4 { fill: #196127; }
      `}</style>
    </Card>
  );
};

export default AttendanceHeatmap;