import React, { useState } from 'react';
import { FilterX, Search, SlidersHorizontal } from 'lucide-react';
import Input from '../ui/Input';
import Button from '../ui/Button';
import Select from '../ui/Select';

interface EventFiltersProps {
  onFilterChange: (filters: FilterValues) => void;
}

export interface FilterValues {
  search: string;
  category: string;
  priceRange: string;
  location: string;
  dateRange: string;
}

const categories = [
  { value: '', label: 'All Categories' },
  { value: 'Technology', label: 'Technology' },
  { value: 'Business', label: 'Business' },
  { value: 'Entertainment', label: 'Entertainment' },
  { value: 'Health', label: 'Health' },
  { value: 'Art', label: 'Art' },
  { value: 'Education', label: 'Education' },
  { value: 'Other', label: 'Other' },
];

const priceRanges = [
  { value: '', label: 'Any Price' },
  { value: 'free', label: 'Free' },
  { value: 'under-50', label: 'Under $50' },
  { value: '50-100', label: '$50 - $100' },
  { value: '100-200', label: '$100 - $200' },
  { value: 'over-200', label: 'Over $200' },
];

const locations = [
  { value: '', label: 'All Locations' },
  { value: 'San Francisco', label: 'San Francisco' },
  { value: 'New York', label: 'New York' },
  { value: 'Chicago', label: 'Chicago' },
  { value: 'Los Angeles', label: 'Los Angeles' },
  { value: 'Online', label: 'Online' },
];

const dateRanges = [
  { value: '', label: 'Any Date' },
  { value: 'today', label: 'Today' },
  { value: 'this-week', label: 'This Week' },
  { value: 'this-weekend', label: 'This Weekend' },
  { value: 'next-week', label: 'Next Week' },
  { value: 'this-month', label: 'This Month' },
  { value: 'next-month', label: 'Next Month' },
];

const EventFilters: React.FC<EventFiltersProps> = ({ onFilterChange }) => {
  const [filters, setFilters] = useState<FilterValues>({
    search: '',
    category: '',
    priceRange: '',
    location: '',
    dateRange: '',
  });
  
  const [isAdvancedFiltersOpen, setIsAdvancedFiltersOpen] = useState(false);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilterChange(filters);
  };
  
  const handleReset = () => {
    const resetFilters = {
      search: '',
      category: '',
      priceRange: '',
      location: '',
      dateRange: '',
    };
    setFilters(resetFilters);
    onFilterChange(resetFilters);
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col md:flex-row md:items-end gap-4 mb-4">
          <div className="flex-grow">
            <Input
              name="search"
              value={filters.search}
              onChange={handleInputChange}
              placeholder="Search events..."
              leftIcon={<Search className="h-5 w-5" />}
              fullWidth
            />
          </div>
          
          <div className="w-full md:w-48">
            <Select
              name="category"
              value={filters.category}
              onChange={handleInputChange}
              options={categories}
              label="Category"
              fullWidth
            />
          </div>
          
          <Button 
            type="button" 
            variant="outline"
            onClick={() => setIsAdvancedFiltersOpen(!isAdvancedFiltersOpen)}
            className="md:self-end"
            leftIcon={<SlidersHorizontal className="h-4 w-4" />}
          >
            {isAdvancedFiltersOpen ? 'Hide Filters' : 'More Filters'}
          </Button>
          
          <Button 
            type="submit"
            className="md:self-end"
          >
            Apply Filters
          </Button>
        </div>
        
        {isAdvancedFiltersOpen && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
            <Select
              name="priceRange"
              value={filters.priceRange}
              onChange={handleInputChange}
              options={priceRanges}
              label="Price Range"
              fullWidth
            />
            
            <Select
              name="location"
              value={filters.location}
              onChange={handleInputChange}
              options={locations}
              label="Location"
              fullWidth
            />
            
            <Select
              name="dateRange"
              value={filters.dateRange}
              onChange={handleInputChange}
              options={dateRanges}
              label="Date"
              fullWidth
            />
            
            <div className="md:col-span-3">
              <Button
                type="button"
                variant="ghost"
                onClick={handleReset}
                leftIcon={<FilterX className="h-4 w-4" />}
                className="text-sm"
              >
                Reset All Filters
              </Button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default EventFilters;