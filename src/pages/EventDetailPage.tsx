import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { useEventStore } from '../store/eventStore';
import { usePaymentStore } from '../store/paymentStore';
import { useAttendanceStore } from '../store/attendanceStore';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';
import Badge from '../components/ui/Badge';
import Card, { CardContent, CardFooter } from '../components/ui/Card';
import AttendanceMarker from '../components/attendance/AttendanceMarker';
import AttendanceTable from '../components/attendance/AttendanceTable';
import { Calendar, Clock, CreditCard, MapPin, Share2, User, Users } from 'lucide-react';
import { Event, Batch, Attendance } from '../types';

interface EnrolledUser {
  id: string;
  name: string;
  email: string;
  batchId?: string;
  enrollmentDate: string;
}

const EventDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const { fetchEventById, enrollInEvent, isLoading, error } = useEventStore();
  const { processPayment, isProcessing } = usePaymentStore();
  
  const [event, setEvent] = useState<Event | null>(null);
  const [selectedBatch, setSelectedBatch] = useState<string>('');
  const [enrollmentSuccess, setEnrollmentSuccess] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [enrolledUsers, setEnrolledUsers] = useState<EnrolledUser[]>([]);
  const [selectedBatchForAttendance, setSelectedBatchForAttendance] = useState<string>('');
  const [attendanceDate, setAttendanceDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [attendanceRecords, setAttendanceRecords] = useState<Attendance[]>([]);
  
  const { fetchAttendance } = useAttendanceStore();

  useEffect(() => {
    const getEvent = async () => {
      if (id) {
        const eventData = await fetchEventById(id);
        if (eventData) {
          setEvent(eventData);
        }
      }
    };
    
    getEvent();
  }, [fetchEventById, id]);

  useEffect(() => {
    const fetchEnrolledUsers = async () => {
      if (event) {
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const mockEnrolledUsers: EnrolledUser[] = [
          {
            id: '1',
            name: 'John Doe',
            email: 'john@example.com',
            batchId: '1-1',
            enrollmentDate: '2025-01-15',
          },
          {
            id: '2',
            name: 'Jane Smith',
            email: 'jane@example.com',
            batchId: '1-2',
            enrollmentDate: '2025-01-16',
          },
        ];
        
        setEnrolledUsers(mockEnrolledUsers);
      }
    };

    fetchEnrolledUsers();
  }, [event]);

  useEffect(() => {
    const loadAttendance = async () => {
      if (event?.id && selectedBatchForAttendance) {
        await fetchAttendance(event.id, selectedBatchForAttendance);
      }
    };

    loadAttendance();
  }, [event?.id, selectedBatchForAttendance, fetchAttendance]);

  const handleBatchSelection = (batchId: string) => {
    setSelectedBatch(batchId);
  };
  
  const handleEnroll = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    if (event && event.price && event.price > 0) {
      setShowPaymentModal(true);
    } else {
      processEnrollment();
    }
  };
  
  const processEnrollment = async () => {
    if (user && event) {
      try {
        if (event.price && event.price > 0) {
          const paymentResult = await processPayment(
            user.id,
            event.id,
            event.price,
            'credit_card'
          );
          
          if (!paymentResult) {
            throw new Error('Payment processing failed');
          }
        }
        
        await enrollInEvent(user.id, event.id, selectedBatch || undefined);
        setEnrollmentSuccess(true);
        setShowPaymentModal(false);
        
        setTimeout(() => {
          setEnrollmentSuccess(false);
        }, 3000);
      } catch (error) {
        console.error('Enrollment failed:', error);
      }
    }
  };

  const renderEnrolledUsers = () => {
    if (!event || !user || (user.role !== 'organizer' && user.role !== 'admin')) {
      return null;
    }

    return (
      <Card className="mb-8">
        <CardContent>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Enrolled Users</h2>
          
          {event.batches && event.batches.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Attendance Tracking</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <select
                  className="rounded-md border border-gray-300 p-2"
                  value={selectedBatchForAttendance}
                  onChange={(e) => setSelectedBatchForAttendance(e.target.value)}
                >
                  <option value="">Select Batch</option>
                  {event.batches.map((batch) => (
                    <option key={batch.id} value={batch.id}>
                      {batch.name}
                    </option>
                  ))}
                </select>
                
                <input
                  type="date"
                  className="rounded-md border border-gray-300 p-2"
                  value={attendanceDate}
                  onChange={(e) => setAttendanceDate(e.target.value)}
                />
              </div>

              {selectedBatchForAttendance && (
                <div className="space-y-4">
                  {enrolledUsers
                    .filter((user) => user.batchId === selectedBatchForAttendance)
                    .map((user) => (
                      <div key={user.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                          <div>
                            <h4 className="font-medium text-gray-900">{user.name}</h4>
                            <p className="text-sm text-gray-600">{user.email}</p>
                          </div>
                        </div>
                        <AttendanceMarker
                          eventId={event.id}
                          batchId={selectedBatchForAttendance}
                          userId={user.id}
                          date={attendanceDate}
                          existingAttendance={attendanceRecords.find(
                            (record) =>
                              record.userId === user.id &&
                              record.date === attendanceDate
                          )}
                          onMarked={() => fetchAttendance(event.id, selectedBatchForAttendance)}
                        />
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}

          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Batch
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Enrollment Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {enrolledUsers.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {event.batches?.find((b) => b.id === user.batchId)?.name || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{user.enrollmentDate}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    );
  };
  
  if (isLoading) {
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
  
  if (!event) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Event Not Found</h2>
            <p className="text-gray-600 mb-8">The event you're looking for doesn't exist or has been removed.</p>
            <Button onClick={() => navigate('/events')}>Browse Events</Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
  
  const remainingSpots = event.capacity - event.enrolled;
  const percentFull = (event.enrolled / event.capacity) * 100;
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow py-10 bg-gray-50">
        <div className="container mx-auto px-4">
          {/* Event Hero Section */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
            <div className="h-80 bg-gray-300 relative">
              <img 
                src={event.imageUrl} 
                alt={event.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 right-4">
                <Badge variant="primary" className="text-sm px-3 py-1">
                  {event.category}
                </Badge>
              </div>
            </div>
            
            <div className="p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{event.title}</h1>
                  <p className="text-gray-600 flex items-center">
                    <User className="h-5 w-5 mr-2 text-indigo-500" />
                    Organized by {event.organizerName}
                  </p>
                </div>
                
                <div className="mt-4 md:mt-0">
                  <div className="flex space-x-4">
                    <Button
                      variant="outline"
                      leftIcon={<Share2 className="h-5 w-5" />}
                      onClick={() => {
                        alert('Share functionality would be implemented here');
                      }}
                    >
                      Share
                    </Button>
                    
                    <Button
                      onClick={handleEnroll}
                      isLoading={isLoading || isProcessing}
                      disabled={remainingSpots === 0}
                    >
                      {remainingSpots === 0 ? 'Sold Out' : `Register Now - $${event?.price != null ? event.price.toFixed(2) : '0.00'}`}
                    </Button>
                  </div>
                </div>
              </div>
              
              {error && (
                <Alert 
                  variant="error" 
                  className="mb-6"
                  onClose={() => useEventStore.setState({ error: null })}
                >
                  {error}
                </Alert>
              )}
              
              {enrollmentSuccess && (
                <Alert variant="success" className="mb-6">
                  You have successfully registered for this event!
                </Alert>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="flex items-center">
                  <Calendar className="h-6 w-6 text-indigo-500 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Date</p>
                    <p className="font-medium">{event.date}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Clock className="h-6 w-6 text-indigo-500 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Time</p>
                    <p className="font-medium">{event.time}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <MapPin className="h-6 w-6 text-indigo-500 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="font-medium">{event.location}</p>
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <Users className="h-5 w-5 text-indigo-500 mr-2" />
                    <span className="text-gray-700 font-medium">
                      {remainingSpots} spots remaining
                    </span>
                  </div>
                  <span className="text-gray-600 text-sm">
                    {event.enrolled} / {event.capacity} registered
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      percentFull >= 90 
                        ? 'bg-red-500' 
                        : percentFull >= 70 
                          ? 'bg-amber-500' 
                          : 'bg-emerald-500'
                    }`} 
                    style={{ width: `${Math.min(percentFull, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Add the enrolled users section */}
          {renderEnrolledUsers()}
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {/* Event Description */}
              <Card className="mb-8">
                <CardContent>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">About This Event</h2>
                  <div className="prose max-w-none text-gray-700">
                    <p className="whitespace-pre-line">{event.description}</p>
                  </div>
                </CardContent>
              </Card>
              
              {/* Batch Selection (if available) */}
              {event.batches && event.batches.length > 0 && (
                <Card className="mb-8">
                  <CardContent>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Available Sessions</h2>
                    <div className="space-y-4">
                      {event.batches.map((batch: Batch) => {
                        const batchRemaining = batch.capacity - batch.enrolled;
                        const isFull = batchRemaining === 0;
                        
                        return (
                          <div 
                            key={batch.id}
                            className={`border rounded-lg p-4 ${
                              selectedBatch === batch.id 
                                ? 'border-indigo-500 bg-indigo-50' 
                                : 'border-gray-200'
                            } ${isFull ? 'opacity-60' : 'cursor-pointer'}`}
                            onClick={() => !isFull && handleBatchSelection(batch.id)}
                          >
                            <div className="flex justify-between items-center mb-2">
                              <h3 className="font-medium text-gray-900">{batch.name}</h3>
                              <Badge variant={isFull ? 'danger' : 'success'}>
                                {isFull ? 'Full' : `${batchRemaining} spots left`}
                              </Badge>
                            </div>
                            <div className="flex items-center text-gray-600 text-sm">
                              <Clock className="h-4 w-4 mr-2" />
                              <span>{batch.startTime} - {batch.endTime}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
            
            <div>
              {/* Registration Card */}
              <Card className="sticky top-24">
                <CardContent>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Registration Details</h3>
                  
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Price</span>
                      <span className="font-semibold text-gray-900">
                        {event?.price != null && event.price > 0 ? `$${event.price.toFixed(2)}` : 'Free'}
                      </span>
                    </div>
                    
                    {event.batches && event.batches.length > 0 && selectedBatch && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Selected Session</span>
                        <span className="font-semibold text-gray-900">
                          {event.batches.find(b => b.id === selectedBatch)?.name || 'None'}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Availability</span>
                      <span className={`font-semibold ${remainingSpots === 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                        {remainingSpots === 0 
                          ? 'Sold Out' 
                          : `${remainingSpots} spots available`}
                      </span>
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter>
                  <Button
                    onClick={handleEnroll}
                    isLoading={isLoading || isProcessing}
                    disabled={remainingSpots === 0}
                    fullWidth
                    leftIcon={<CreditCard className="h-5 w-5" />}
                  >
                    {remainingSpots === 0 
                      ? 'Sold Out' 
                      : event?.price != null && event.price > 0
                        ? `Register for $${event.price.toFixed(2)}`
                        : 'Register for Free'}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </main>
      
      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4"
          >
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Complete Payment</h2>
              
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Order Summary</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Event</span>
                    <span className="font-medium">{event.title}</span>
                  </div>
                  {selectedBatch && event.batches && (
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Session</span>
                      <span className="font-medium">
                        {event.batches.find(b => b.id === selectedBatch)?.name}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Date</span>
                    <span className="font-medium">{event.date}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-200">
                    <span className="text-gray-800 font-semibold">Total</span>
                    <span className="text-gray-800 font-semibold">${event?.price != null ? event.price.toFixed(2) : '0.00'}</span>
                  </div>
                </div>
              </div>
              
              {/* This would be a real payment form in a production app */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Payment Method</h3>
                <div className="space-y-4">
                  <div className="border rounded-lg p-4 flex items-center cursor-pointer bg-indigo-50 border-indigo-500">
                    <div className="h-5 w-5 rounded-full border-2 border-indigo-500 flex items-center justify-center mr-3">
                      <div className="h-2 w-2 bg-indigo-500 rounded-full"></div>
                    </div>
                    <div className="flex-grow">
                      <p className="font-medium">Credit Card</p>
                    </div>
                    <div className="flex space-x-2">
                      <div className="h-8 w-12 bg-gray-200 rounded"></div>
                      <div className="h-8 w-12 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                  
                  {/* Mock payment form */}
                  <div className="space-y-4 p-4 border rounded-lg">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Card Number
                      </label>
                      <input 
                        type="text" 
                        className="w-full p-2 border rounded-md" 
                        placeholder="4242 4242 4242 4242" 
                        disabled={isProcessing}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Expiry Date
                        </label>
                        <input 
                          type="text" 
                          className="w-full p-2 border rounded-md" 
                          placeholder="MM/YY" 
                          disabled={isProcessing}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          CVC
                        </label>
                        <input 
                          type="text" 
                          className="w-full p-2 border rounded-md" 
                          placeholder="123" 
                          disabled={isProcessing}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-4">
                <Button 
                  variant="outline" 
                  fullWidth
                  onClick={() => setShowPaymentModal(false)}
                  disabled={isProcessing}
                >
                  Cancel
                </Button>
                <Button 
                  fullWidth
                  onClick={processEnrollment}
                  isLoading={isProcessing}
                  leftIcon={<CreditCard className="h-5 w-5" />}
                >
                  Pay ${event?.price != null ? event.price.toFixed(2) : '0.00'}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
      
      <Footer />
    </div>
  );
};

export default EventDetailPage;