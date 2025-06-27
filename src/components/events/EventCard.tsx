import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, Users } from 'lucide-react';
import { Event } from '../../types';
import Badge from '../ui/Badge';

interface EventCardProps {
  event: Event;
}

const EventCard: React.FC<EventCardProps> = ({ event }) => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    navigate(`/events/${event.id}`);
  };
  
  // Calculate remaining spots
  const remainingSpots = (event.capacity || 0) - (event.enrolled || 0);
  const percentFull = event.capacity ? ((event.enrolled || 0) / event.capacity) * 100 : 0;
  
  let statusVariant: 'success' | 'warning' | 'danger' = 'success';
  if (percentFull >= 90) {
    statusVariant = 'danger';
  } else if (percentFull >= 70) {
    statusVariant = 'warning';
  }

  return (
    <motion.div
      className="h-full"
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
      onClick={handleClick}
    >
      <div className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer h-full flex flex-col">
        <div className="relative h-48 overflow-hidden">
          <img 
            src={event.imageUrl} 
            alt={event.name}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
          <div className="absolute top-4 right-4">
            <Badge variant="primary">{event.category}</Badge>
          </div>
        </div>
        
        <div className="p-5 flex flex-col flex-grow">
          <h3 className="text-lg font-semibold mb-2 text-gray-900">{event.name}</h3>
          
          <div className="space-y-2 mb-4 text-sm text-gray-600">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-indigo-500" />
              <span>{event.date}</span>
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2 text-indigo-500" />
              <span>{event.time}</span>
            </div>
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-2 text-indigo-500" />
              <span>{event.location}</span>
            </div>
          </div>
          
          <p className="text-gray-500 text-sm line-clamp-2 mb-4">
            {event.description}
          </p>
          
          <div className="mt-auto">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center text-sm">
                <Users className="h-4 w-4 mr-1 text-indigo-500" />
                <span>
                  <Badge variant={statusVariant}>
                    {remainingSpots} spots left
                  </Badge>
                </span>
              </div>
              <span className="font-semibold text-gray-900">
                {event.base_price === 0 ? 'Free' : `$${event.base_price.toFixed(2)}`}
              </span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div 
                className={`h-1.5 rounded-full ${
                  statusVariant === 'danger' 
                    ? 'bg-red-500' 
                    : statusVariant === 'warning' 
                      ? 'bg-amber-500' 
                      : 'bg-emerald-500'
                }`} 
                style={{ width: `${Math.min(percentFull, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default EventCard;