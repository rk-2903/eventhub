import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useEventStore } from '../store/eventStore';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import EventCard from '../components/events/EventCard';
import EventFilters, { FilterValues } from '../components/events/EventFilters';
import { Event } from '../types';

const EventsPage: React.FC = () => {
  const { events, fetchEvents, isLoading } = useEventStore();
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();
  
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);
  
  useEffect(() => {
    if (events.length > 0) {
      // Check URL parameters for initial filters
      const initialFilters: FilterValues = {
        search: searchParams.get('search') || '',
        category: searchParams.get('category') || '',
        priceRange: searchParams.get('priceRange') || '',
        location: searchParams.get('location') || '',
        dateRange: searchParams.get('dateRange') || '',
      };
      
      handleFilterChange(initialFilters);
    }
  }, [events, searchParams]);
  
  const handleFilterChange = (filters: FilterValues) => {
    let filtered = [...events];
    
    // Update URL params
    const params: Record<string, string> = {};
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params[key] = value;
    });
    setSearchParams(params);
    
    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        event => 
          event.title.toLowerCase().includes(searchLower) || 
          event.description.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply category filter
    if (filters.category) {
      filtered = filtered.filter(event => event.category === filters.category);
    }
    
    // Apply price range filter
    if (filters.priceRange) {
      switch (filters.priceRange) {
        case 'free':
          filtered = filtered.filter(event => event.price === 0);
          break;
        case 'under-50':
          filtered = filtered.filter(event => event.price > 0 && event.price < 50);
          break;
        case '50-100':
          filtered = filtered.filter(event => event.price >= 50 && event.price <= 100);
          break;
        case '100-200':
          filtered = filtered.filter(event => event.price > 100 && event.price <= 200);
          break;
        case 'over-200':
          filtered = filtered.filter(event => event.price > 200);
          break;
      }
    }
    
    // Apply location filter
    if (filters.location) {
      filtered = filtered.filter(event => event.location.includes(filters.location));
    }
    
    // Apply date range filter (simplified for demo)
    // In a real app, you would use date-fns or similar to properly filter by date
    if (filters.dateRange) {
      // This is just a placeholder - in a real app you would implement actual date filtering
      // based on the date range selected
    }
    
    setFilteredEvents(filtered);
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow py-10 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Discover Events</h1>
            <p className="text-gray-600">Find and join upcoming events that match your interests</p>
          </div>
          
          <EventFilters onFilterChange={handleFilterChange} />
          
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : filteredEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredEvents.map((event) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <EventCard event={event} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No events found</h3>
              <p className="text-gray-500">Try adjusting your filters to find more events</p>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default EventsPage;