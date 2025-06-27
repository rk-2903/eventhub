import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { useEventStore } from '../store/eventStore';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import Card, { CardContent, CardFooter } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { CalendarDays, ChevronRight, Clock, MapPin, AlertCircle } from 'lucide-react';
import { Event } from '../types';

const UserEventsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const { events, userEnrollments, fetchEvents, fetchUserEnrollments, cancelEnrollment, isLoading } = useEventStore();
  const [userEvents, setUserEvents] = useState<Event[]>([]);
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    fetchEvents();
  }, [fetchEvents, isAuthenticated, navigate]);
  
  useEffect(() => {
    if (user) {
      fetchUserEnrollments(user.id);
    }
  }, [fetchUserEnrollments, user]);
  
  useEffect(() => {
    if (userEnrollments.length > 0 && events.length > 0) {
      // Get full event details for each enrollment
      const enrolledEvents = userEnrollments.map(enrollment => {
        const event = events.find(e => e.id === enrollment.eventId);
        return {
          ...event,
          enrollmentId: enrollment.id,
          enrollmentStatus: enrollment.status,
          paymentStatus: enrollment.paymentStatus,
          batchId: enrollment.batchId
        };
      }).filter(Boolean) as (Event & { 
        enrollmentId: string; 
        enrollmentStatus: string; 
        paymentStatus: string;
        batchId?: string;
      })[];
      
      setUserEvents(enrolledEvents as Event[]);
    }
  }, [userEnrollments, events]);
  
  const handleCancelEnrollment = async (enrollmentId: string) => {
    if (confirm('Are you sure you want to cancel this enrollment?')) {
      await cancelEnrollment(enrollmentId);
      
      // Update the user events list
      setUserEvents(prevEvents => 
        prevEvents.filter((event: any) => event.enrollmentId !== enrollmentId)
      );
    }
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
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow py-10 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Events</h1>
            <p className="text-gray-600">Manage your event registrations and enrollments</p>
          </div>
          
          {userEvents.length > 0 ? (
            <div className="space-y-6">
              {userEvents.map((event: any) => (
                <motion.div
                  key={event.enrollmentId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="w-full"
                >
                  <Card>
                    <div className="flex flex-col md:flex-row">
                      <div className="md:w-1/4 h-48 md:h-auto overflow-hidden">
                        <img 
                          src={event.imageUrl} 
                          alt={event.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      <div className="p-6 flex-grow">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
                            <p className="text-sm text-gray-600">Organized by {event.organizerName}</p>
                          </div>
                          
                          <div className="flex space-x-2">
                            <Badge 
                              variant={
                                event.enrollmentStatus === 'confirmed' 
                                  ? 'success' 
                                  : event.enrollmentStatus === 'cancelled' 
                                    ? 'danger' 
                                    : 'warning'
                              }
                            >
                              {event.enrollmentStatus.charAt(0).toUpperCase() + event.enrollmentStatus.slice(1)}
                            </Badge>
                            
                            <Badge 
                              variant={
                                event.paymentStatus === 'completed' 
                                  ? 'success' 
                                  : event.paymentStatus === 'refunded' 
                                    ? 'warning' 
                                    : 'danger'
                              }
                            >
                              {event.paymentStatus === 'completed' 
                                ? 'Paid' 
                                : event.paymentStatus === 'refunded' 
                                  ? 'Refunded' 
                                  : 'Payment Due'}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div className="flex items-center">
                            <CalendarDays className="h-5 w-5 text-indigo-500 mr-2" />
                            <span className="text-sm text-gray-600">{event.date}</span>
                          </div>
                          
                          <div className="flex items-center">
                            <Clock className="h-5 w-5 text-indigo-500 mr-2" />
                            <span className="text-sm text-gray-600">{event.time}</span>
                          </div>
                          
                          <div className="flex items-center">
                            <MapPin className="h-5 w-5 text-indigo-500 mr-2" />
                            <span className="text-sm text-gray-600">{event.location}</span>
                          </div>
                        </div>
                        
                        {event.batchId && event.batches && (
                          <div className="mb-4 p-3 bg-gray-50 rounded-md">
                            <p className="text-sm text-gray-700">
                              <span className="font-medium">Selected Session: </span>
                              {event.batches.find(b => b.id === event.batchId)?.name || 'N/A'} 
                              ({event.batches.find(b => b.id === event.batchId)?.startTime} - 
                              {event.batches.find(b => b.id === event.batchId)?.endTime})
                            </p>
                          </div>
                        )}
                        
                        {event.enrollmentStatus === 'pending' && (
                          <div className="flex items-start mb-4 p-3 bg-amber-50 rounded-md">
                            <AlertCircle className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-amber-700">
                              Your enrollment is pending. Please complete the payment to confirm your spot.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <CardFooter className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-gray-600">
                          {event.price === 0 
                            ? 'Free Event' 
                            : `Price: $${event.price.toFixed(2)}`}
                        </p>
                      </div>
                      
                      <div className="flex space-x-2">
                        {event.enrollmentStatus !== 'cancelled' && (
                          <Button 
                            variant="outline"
                            className="text-red-500 border-red-500 hover:bg-red-50"
                            onClick={() => handleCancelEnrollment(event.enrollmentId)}
                          >
                            Cancel Registration
                          </Button>
                        )}
                        
                        <Link to={`/events/${event.id}`}>
                          <Button rightIcon={<ChevronRight className="h-5 w-5" />}>
                            View Event
                          </Button>
                        </Link>
                      </div>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                <CalendarDays className="h-12 w-12 text-gray-400" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">No Events Yet</h2>
              <p className="text-gray-600 mb-6">You haven't registered for any events yet.</p>
              <Link to="/events">
                <Button>
                  Browse Events
                </Button>
              </Link>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default UserEventsPage;