import React from 'react';
import type { CarFilters } from '../../types/car';

interface CarFiltersProps {
  filters: CarFilters;
  onFiltersChange: (filters: CarFilters) => void;
}

const CarFiltersComponent: React.FC<CarFiltersProps> = ({ filters, onFiltersChange }) => {
  const categories = ['All', 'Sedan', 'SUV', 'Hatchback', 'Sports', 'Electric', 'Luxury'];
  const makes = ['All', 'Toyota', 'Ford', 'BMW', 'Mercedes', 'Audi', 'Tesla', 'Honda', 'Nissan'];

  const handleFilterChange = (key: keyof CarFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value === 'All' ? undefined : value
    });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h3 className="text-lg font-semibold mb-4">Filter Cars</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Make Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Make</label>
          <select
            value={filters.make || 'All'}
            onChange={(e) => handleFilterChange('make', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {makes.map((make) => (
              <option key={make} value={make}>{make}</option>
            ))}
          </select>
        </div>

        {/* Category Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
          <select
            value={filters.category || 'All'}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {categories.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        {/* Price Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Max Price/Day</label>
          <input
            type="number"
            placeholder="Max price"
            value={filters.maxPrice || ''}
            onChange={(e) => handleFilterChange('maxPrice', e.target.value ? parseInt(e.target.value) : undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Availability */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Availability</label>
          <select
            value={filters.isAvailable === undefined ? 'All' : filters.isAvailable ? 'Available' : 'Unavailable'}
            onChange={(e) => handleFilterChange('isAvailable', 
              e.target.value === 'All' ? undefined : e.target.value === 'Available'
            )}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All</option>
            <option value="Available">Available</option>
            <option value="Unavailable">Unavailable</option>
          </select>
        </div>
      </div>

      <button
        onClick={() => onFiltersChange({})}
        className="mt-4 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded text-sm transition-colors"
      >
        Clear Filters
      </button>
    </div>
  );
};

export default CarFiltersComponent;
