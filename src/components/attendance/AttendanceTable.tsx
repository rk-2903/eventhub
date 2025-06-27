import React from 'react';
import { format } from 'date-fns';
import { Attendance } from '../../types';
import Badge from '../ui/Badge';
import { Check, Clock, X } from 'lucide-react';

interface AttendanceTableProps {
  records: Attendance[];
  showUserDetails?: boolean;
}

const AttendanceTable: React.FC<AttendanceTableProps> = ({
  records,
  showUserDetails = false,
}) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'present':
        return <Badge variant="success">Present</Badge>;
      case 'absent':
        return <Badge variant="danger">Absent</Badge>;
      case 'late':
        return <Badge variant="warning">Late</Badge>;
      default:
        return null;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present':
        return <Check className="h-4 w-4 text-emerald-500" />;
      case 'absent':
        return <X className="h-4 w-4 text-red-500" />;
      case 'late':
        return <Clock className="h-4 w-4 text-amber-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
            {showUserDetails && (
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
            )}
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Notes
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {records.map((record) => (
            <tr key={record.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {format(new Date(record.date), 'MMM dd, yyyy')}
              </td>
              {showUserDetails && (
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {record.userId}
                </td>
              )}
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  {getStatusIcon(record.status)}
                  <span className="ml-2">{getStatusBadge(record.status)}</span>
                </div>
              </td>
              <td className="px-6 py-4 text-sm text-gray-500">
                {record.notes || '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AttendanceTable;