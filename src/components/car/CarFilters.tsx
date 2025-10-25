import React from 'react';
import Button from '../common/UI/Button';
import type { CarFilters } from '../../types/car';

interface CarFiltersComponentProps {
  filters: CarFilters;
  onFiltersChange: (filters: CarFilters) => void;
}

const CarFiltersComponent: React.FC<CarFiltersComponentProps> = ({
  filters,
  onFiltersChange
}) => {
  const handleFilterChange = (key: keyof CarFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const selectClassName = "w-full px-4 py-3 bg-gray-800 border-2 border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 transition-all duration-300";

  return (
    <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl shadow-lg mb-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Filters
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
        >
          Clear All
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Make Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Make
          </label>
          <select
            value={filters.make || ''}
            onChange={(e) => handleFilterChange('make', e.target.value || undefined)}
            className={selectClassName}
          >
            <option value="">All Makes</option>
            <option value="Toyota">Toyota</option>
            <option value="Ford">Ford</option>
            <option value="Chevrolet">Chevrolet</option>
            <option value="Honda">Honda</option>
            <option value="Nissan">Nissan</option>
            <option value="BMW">BMW</option>
            <option value="Mercedes-Benz">Mercedes-Benz</option>
            <option value="Audi">Audi</option>
            <option value="Tesla">Tesla</option>
          </select>
        </div>

        {/* Category Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Category
          </label>
          <select
            value={filters.category || ''}
            onChange={(e) => handleFilterChange('category', e.target.value || undefined)}
            className={selectClassName}
          >
            <option value="">All Categories</option>
            <option value="Sedan">Sedan</option>
            <option value="SUV">SUV</option>
            <option value="Hatchback">Hatchback</option>
            <option value="Sports">Sports</option>
            <option value="Electric">Electric</option>
            <option value="Luxury">Luxury</option>
            <option value="Truck">Truck</option>
            <option value="Convertible">Convertible</option>
          </select>
        </div>

        {/* Price Range */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Max Price per Day
          </label>
          <select
            value={filters.maxPrice || ''}
            onChange={(e) => handleFilterChange('maxPrice', e.target.value ? parseInt(e.target.value) : undefined)}
            className={selectClassName}
          >
            <option value="">Any Price</option>
            <option value="50">Under $50</option>
            <option value="75">Under $75</option>
            <option value="100">Under $100</option>
            <option value="150">Under $150</option>
            <option value="200">Under $200</option>
          </select>
        </div>

        {/* Availability Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Availability
          </label>
          <select
            value={filters.isAvailable !== undefined ? filters.isAvailable.toString() : ''}
            onChange={(e) => {
              const value = e.target.value;
              handleFilterChange('isAvailable', value === '' ? undefined : value === 'true');
            }}
            className={selectClassName}
          >
            <option value="">All Cars</option>
            <option value="true">Available Only</option>
            <option value="false">Unavailable Only</option>
          </select>
        </div>
      </div>

      {/* Active Filters Display */}
      {Object.keys(filters).some(key => filters[key as keyof CarFilters]) && (
        <div className="mt-5 flex flex-wrap gap-2 items-center">
          <span className="text-sm text-gray-400 font-medium">Active filters:</span>
          {filters.make && (
            <span className="bg-purple-500/20 border border-purple-500/50 text-purple-300 px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-2">
              Make: {filters.make}
              <button
                onClick={() => handleFilterChange('make', undefined)}
                className="text-purple-300 hover:text-white transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          )}
          {filters.category && (
            <span className="bg-purple-500/20 border border-purple-500/50 text-purple-300 px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-2">
              Category: {filters.category}
              <button
                onClick={() => handleFilterChange('category', undefined)}
                className="text-purple-300 hover:text-white transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          )}
          {filters.maxPrice && (
            <span className="bg-purple-500/20 border border-purple-500/50 text-purple-300 px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-2">
              Max Price: ${filters.maxPrice}
              <button
                onClick={() => handleFilterChange('maxPrice', undefined)}
                className="text-purple-300 hover:text-white transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          )}
          {filters.isAvailable !== undefined && (
            <span className="bg-purple-500/20 border border-purple-500/50 text-purple-300 px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-2">
              {filters.isAvailable ? 'Available Only' : 'Unavailable Only'}
              <button
                onClick={() => handleFilterChange('isAvailable', undefined)}
                className="text-purple-300 hover:text-white transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default CarFiltersComponent;
