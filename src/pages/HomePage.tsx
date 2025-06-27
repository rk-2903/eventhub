import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useEventStore } from '../store/eventStore';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import EventCard from '../components/events/EventCard';
import Button from '../components/ui/Button';
import { ArrowRight, Calendar, Search, Shield, Users } from 'lucide-react';

const HomePage: React.FC = () => {
  const { events, fetchEvents, isLoading } = useEventStore();
  
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);
  
  // Get featured events (most recent 3)
  const featuredEvents = events.slice(0, 3);
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-indigo-600 to-sky-500 text-white">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="flex flex-col md:flex-row items-center">
            <motion.div 
              className="md:w-1/2 mb-10 md:mb-0"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
                Discover and Join Amazing Events Near You
              </h1>
              <p className="text-lg md:text-xl mb-8 opacity-90">
                Find the perfect events to attend, learn new skills, meet like-minded people, and create lasting memories.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Link to="/events">
                  <Button size="lg" rightIcon={<Search className="h-5 w-5" />}>
                    Explore Events
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-indigo-600">
                    Create Account
                  </Button>
                </Link>
              </div>
            </motion.div>
            
            <motion.div 
              className="md:w-1/2 md:pl-12"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <img 
                src="https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
                alt="Event crowd" 
                className="rounded-lg shadow-2xl"
              />
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Featured Events Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Events</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Discover our handpicked selection of the most exciting upcoming events.
            </p>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredEvents.map((event) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 * parseInt(event.id) }}
                >
                  <EventCard event={event} />
                </motion.div>
              ))}
            </div>
          )}
          
          <div className="text-center mt-12">
            <Link to="/events">
              <Button rightIcon={<ArrowRight className="h-5 w-5" />}>
                View All Events
              </Button>
            </Link>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose EventHub</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              We make it easy to discover, attend, and organize events that matter to you.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div 
              className="bg-white p-8 rounded-lg shadow-md text-center"
              whileHover={{ y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-indigo-100 text-indigo-600 mb-6">
                <Search className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Easy Discovery</h3>
              <p className="text-gray-600">
                Find events that match your interests with powerful search and filtering options.
              </p>
            </motion.div>
            
            <motion.div 
              className="bg-white p-8 rounded-lg shadow-md text-center"
              whileHover={{ y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-sky-100 text-sky-600 mb-6">
                <Users className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Community Building</h3>
              <p className="text-gray-600">
                Connect with like-minded people and build your network at events you care about.
              </p>
            </motion.div>
            
            <motion.div 
              className="bg-white p-8 rounded-lg shadow-md text-center"
              whileHover={{ y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-emerald-100 text-emerald-600 mb-6">
                <Shield className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Secure Payments</h3>
              <p className="text-gray-600">
                Register for events with confidence using our secure payment processing system.
              </p>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 bg-indigo-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">Ready to Start Your Event Journey?</h2>
            <p className="text-lg mb-8 opacity-90">
              Join thousands of people who use EventHub to discover and attend amazing events every day.
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Link to="/register">
                <Button size="lg" className="bg-white text-indigo-600 hover:bg-gray-100">
                  Sign Up Now
                </Button>
              </Link>
              <Link to="/events">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-indigo-600">
                  Browse Events
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default HomePage;