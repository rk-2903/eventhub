import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useUserProfileStore } from '../store/userProfileStore';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import UserStats from '../components/profile/UserStats';
import AttendanceHeatmap from '../components/profile/AttendanceHeatmap';
import Card from '../components/ui/Card';
import { format } from 'date-fns';
import { Mail, Phone, MapPin, Calendar } from 'lucide-react';

const UserProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const { profile, fetchUserProfile, isLoading } = useUserProfileStore();

  useEffect(() => {
    if (userId) {
      fetchUserProfile(userId);
    }
  }, [userId, fetchUserProfile]);

  if (isLoading || !profile) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow py-10 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <div className="md:flex">
                <div className="md:flex-shrink-0">
                  <img
                    className="h-48 w-full object-cover md:w-48"
                    src={profile.user.avatar || 'https://via.placeholder.com/200'}
                    alt={profile.user.name}
                  />
                </div>
                <div className="p-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900">{profile.user.name}</h1>
                      <p className="mt-1 text-gray-600">{profile.user.role}</p>
                    </div>
                  </div>
                  
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center text-gray-600">
                      <Mail className="h-5 w-5 mr-2" />
                      <span>{profile.user.email}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Phone className="h-5 w-5 mr-2" />
                      <span>{profile.user.phone}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <MapPin className="h-5 w-5 mr-2" />
                      <span>{profile.user.address}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Calendar className="h-5 w-5 mr-2" />
                      <span>Joined {format(new Date(profile.user.joinDate), 'MMM dd, yyyy')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="mb-8">
            <UserStats
              totalEvents={profile.stats.totalEvents}
              completedEvents={profile.stats.completedEvents}
              upcomingEvents={profile.stats.upcomingEvents}
              attendanceRate={profile.stats.attendanceRate}
            />
          </div>

          <div className="mb-8">
            <AttendanceHeatmap attendance={profile.attendance} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Enrollments</h3>
              <div className="space-y-4">
                {profile.enrollments.map((enrollment) => (
                  <div
                    key={enrollment.id}
                    className="border rounded-lg p-4"
                  >
                    <h4 className="font-medium text-gray-900">{enrollment.event.title}</h4>
                    <div className="mt-2 grid grid-cols-2 gap-2 text-sm text-gray-600">
                      <div>Start Date: {format(new Date(enrollment.startDate), 'MMM dd, yyyy')}</div>
                      <div>End Date: {format(new Date(enrollment.endDate), 'MMM dd, yyyy')}</div>
                      {enrollment.nextPaymentDate && (
                        <div className="col-span-2">
                          Next Payment: {format(new Date(enrollment.nextPaymentDate), 'MMM dd, yyyy')}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment History</h3>
              <div className="space-y-4">
                {profile.payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="border rounded-lg p-4"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-900">
                        ${payment.amount.toFixed(2)}
                      </span>
                      <span className="text-sm text-gray-600">
                        {format(new Date(payment.paymentDate), 'MMM dd, yyyy')}
                      </span>
                    </div>
                    <div className="mt-1 text-sm text-gray-600">
                      Transaction ID: {payment.transactionId}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default UserProfilePage;