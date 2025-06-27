import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, CheckCircle, Clock, Percent } from 'lucide-react';
import Card from '../ui/Card';

interface UserStatsProps {
  totalEvents: number;
  completedEvents: number;
  upcomingEvents: number;
  attendanceRate: number;
}

const UserStats: React.FC<UserStatsProps> = ({
  totalEvents,
  completedEvents,
  upcomingEvents,
  attendanceRate,
}) => {
  const stats = [
    {
      label: 'Total Events',
      value: totalEvents,
      icon: <Calendar className="h-6 w-6 text-indigo-600" />,
      color: 'bg-indigo-100',
    },
    {
      label: 'Completed',
      value: completedEvents,
      icon: <CheckCircle className="h-6 w-6 text-emerald-600" />,
      color: 'bg-emerald-100',
    },
    {
      label: 'Upcoming',
      value: upcomingEvents,
      icon: <Clock className="h-6 w-6 text-amber-600" />,
      color: 'bg-amber-100',
    },
    {
      label: 'Attendance',
      value: `${attendanceRate}%`,
      icon: <Percent className="h-6 w-6 text-sky-600" />,
      color: 'bg-sky-100',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <Card className="p-6">
            <div className="flex items-center">
              <div className={`p-3 rounded-full ${stat.color}`}>
                {stat.icon}
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

export default UserStats;