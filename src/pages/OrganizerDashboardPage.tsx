import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '../store/authStore';
import { useEventStore } from '../store/eventStore';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Card, { CardContent, CardHeader } from '../components/ui/Card';
import Alert from '../components/ui/Alert';
import Badge from '../components/ui/Badge';
import { Calendar, ChevronRight, Clock, DollarSign, MapPin, Plus, User, Users } from 'lucide-react';
import { Event } from '../types';

interface EventFormData {
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  category: string;
  price: number;
  capacity: number;
  imageUrl: string;
}

const OrganizerDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const { events, fetchEvents, createEvent, isLoading, error } = useEventStore();
  
  const [organizerEvents, setOrganizerEvents] = useState<Event[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createSuccess, setCreateSuccess] = useState(false);
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<EventFormData>();
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    if (user && user.role !== 'organizer' && user.role !== 'admin') {
      navigate('/');
      return;
    }
    
    fetchEvents();
  }, [fetchEvents, isAuthenticated, navigate, user]);
  
  useEffect(() => {
    if (user && events.length > 0) {
      const filteredEvents = events.filter(event => event.organizerId === user.id);
      setOrganizerEvents(filteredEvents);
    }
  }, [events, user]);
  
  const onSubmit = async (data: EventFormData) => {
    if (user) {
      const eventData = {
        ...data,
        organizerId: user.id,
        organizerName: user.name,
        enrolled: 0,
      };
      
      await createEvent(eventData);
      
      setCreateSuccess(true);
      setShowCreateForm(false);
      reset();
      
      // Refresh events list
      fetchEvents();
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setCreateSuccess(false);
      }, 3000);
    }
  };
  
  const categoryOptions = [
    { value: 'Technology', label: 'Technology' },
    { value: 'Business', label: 'Business' },
    { value: 'Entertainment', label: 'Entertainment' },
    { value: 'Health', label: 'Health' },
    { value: 'Art', label: 'Art' },
    { value: 'Education', label: 'Education' },
    { value: 'Other', label: 'Other' },
  ];
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow py-10 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Organizer Dashboard</h1>
              <p className="text-gray-600">Create and manage your events</p>
            </div>
            
            <Button 
              leftIcon={<Plus className="h-5 w-5" />}
              onClick={() => setShowCreateForm(!showCreateForm)}
            >
              Create Event
            </Button>
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
          
          {createSuccess && (
            <Alert variant="success" className="mb-6">
              Event created successfully!
            </Alert>
          )}
          
          {/* Create Event Form */}
          {showCreateForm && (
            <Card className="mb-8">
              <CardHeader>
                <h2 className="text-xl font-semibold text-gray-900">Create New Event</h2>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label="Event Title"
                      placeholder="Enter event title"
                      error={errors.title?.message}
                      fullWidth
                      {...register('title', { 
                        required: 'Title is required',
                        minLength: {
                          value: 5,
                          message: 'Title must be at least 5 characters',
                        },
                      })}
                    />
                    
                    <Select
                      label="Category"
                      options={categoryOptions}
                      error={errors.category?.message}
                      fullWidth
                      {...register('category', { 
                        required: 'Category is required',
                      })}
                    />
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        rows={4}
                        className="w-full rounded-md border border-gray-300 p-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="Enter event description"
                        {...register('description', { 
                          required: 'Description is required',
                          minLength: {
                            value: 20,
                            message: 'Description must be at least 20 characters',
                          },
                        })}
                      />
                      {errors.description && (
                        <p className="mt-1 text-sm text-red-500">{errors.description.message}</p>
                      )}
                    </div>
                    
                    <Input
                      label="Date"
                      type="date"
                      leftIcon={<Calendar className="h-5 w-5" />}
                      error={errors.date?.message}
                      fullWidth
                      {...register('date', { 
                        required: 'Date is required',
                      })}
                    />
                    
                    <Input
                      label="Time"
                      placeholder="e.g. 09:00 - 17:00"
                      leftIcon={<Clock className="h-5 w-5" />}
                      error={errors.time?.message}
                      fullWidth
                      {...register('time', { 
                        required: 'Time is required',
                      })}
                    />
                    
                    <Input
                      label="Location"
                      placeholder="Event location"
                      leftIcon={<MapPin className="h-5 w-5" />}
                      error={errors.location?.message}
                      fullWidth
                      {...register('location', { 
                        required: 'Location is required',
                      })}
                    />
                    
                    <Input
                      label="Price ($)"
                      type="number"
                      step="0.01"
                      min="0"
                      leftIcon={<DollarSign className="h-5 w-5" />}
                      error={errors.price?.message}
                      fullWidth
                      {...register('price', { 
                        required: 'Price is required',
                        min: {
                          value: 0,
                          message: 'Price cannot be negative',
                        },
                        valueAsNumber: true,
                      })}
                    />
                    
                    <Input
                      label="Capacity"
                      type="number"
                      min="1"
                      leftIcon={<Users className="h-5 w-5" />}
                      error={errors.capacity?.message}
                      fullWidth
                      {...register('capacity', { 
                        required: 'Capacity is required',
                        min: {
                          value: 1,
                          message: 'Capacity must be at least 1',
                        },
                        valueAsNumber: true,
                      })}
                    />
                    
                    <Input
                      label="Event Image URL"
                      placeholder="https://example.com/image.jpg"
                      error={errors.imageUrl?.message}
                      fullWidth
                      {...register('imageUrl', { 
                        required: 'Image URL is required',
                        pattern: {
                          value: /^https?:\/\/.+\..+/,
                          message: 'Must be a valid URL',
                        },
                      })}
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-4">
                    <Button 
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowCreateForm(false);
                        reset();
                      }}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit"
                      isLoading={isLoading}
                    >
                      Create Event
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
          
          {/* Events List */}
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Your Events</h2>
          
          {organizerEvents.length > 0 ? (
            <div className="space-y-6">
              {organizerEvents.map((event) => (
                <Card key={event.id} hover onClick={() => navigate(`/events/${event.id}`)}>
                  <div className="flex flex-col md:flex-row p-6">
                    <div className="md:w-1/5 h-32 md:h-auto rounded-md overflow-hidden mb-4 md:mb-0 md:mr-6">
                      <img 
                        src={event.imageUrl} 
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <div className="flex-grow">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
                          <Badge variant="primary" className="mt-1">{event.category}</Badge>
                        </div>
                        
                        <div className="mt-2 md:mt-0">
                          <span className="text-lg font-semibold text-gray-900">
                            {event.price === 0 ? 'Free' : `$${event.price.toFixed(2)}`}
                          </span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                        <div className="flex items-center">
                          <Calendar className="h-5 w-5 text-indigo-500 mr-2" />
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
                        
                        <div className="flex items-center">
                          <Users className="h-5 w-5 text-indigo-500 mr-2" />
                          <span className="text-sm text-gray-600">
                            {event.enrolled} / {event.capacity} enrolled
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <p className="text-sm text-gray-500 line-clamp-1 mr-4">
                          {event.description}
                        </p>
                        
                        <div className="flex-shrink-0">
                          <ChevronRight className="h-5 w-5 text-gray-400" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                <Calendar className="h-12 w-12 text-gray-400" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">No Events Created</h2>
              <p className="text-gray-600 mb-6">You haven't created any events yet.</p>
              <Button 
                onClick={() => setShowCreateForm(true)}
                leftIcon={<Plus className="h-5 w-5" />}
              >
                Create Your First Event
              </Button>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default OrganizerDashboardPage;