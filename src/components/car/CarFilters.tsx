import React from 'react'
import type { CarFilters } from '../../types/car'

interface CarFiltersComponentProps {
  filters: CarFilters
  onFiltersChange: (filters: CarFilters) => void
}

const CarFiltersComponent: React.FC<CarFiltersComponentProps> = ({
  filters,
  onFiltersChange
}) => {
  const handleFilterChange = (key: keyof CarFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const clearFilters = () => {
    onFiltersChange({})
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
        <button
          onClick={clearFilters}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          Clear All
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Make Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Make
          </label>
          <select
            value={filters.make || ''}
            onChange={(e) => handleFilterChange('make', e.target.value || undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category
          </label>
          <select
            value={filters.category || ''}
            onChange={(e) => handleFilterChange('category', e.target.value || undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Max Price per Day
          </label>
          <select
            value={filters.maxPrice || ''}
            onChange={(e) => handleFilterChange('maxPrice', e.target.value ? parseInt(e.target.value) : undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Availability
          </label>
          <select
            value={filters.isAvailable !== undefined ? filters.isAvailable.toString() : ''}
            onChange={(e) => {
              const value = e.target.value
              handleFilterChange('isAvailable', value === '' ? undefined : value === 'true')
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Cars</option>
            <option value="true">Available Only</option>
            <option value="false">Unavailable Only</option>
          </select>
        </div>
      </div>

      {/* Active Filters Display */}
      {Object.keys(filters).some(key => filters[key as keyof CarFilters]) && (
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="text-sm text-gray-600">Active filters:</span>
          {filters.make && (
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
              Make: {filters.make}
              <button
                onClick={() => handleFilterChange('make', undefined)}
                className="ml-1 text-blue-600 hover:text-blue-800"
              >
                ×
              </button>
            </span>
          )}
          {filters.category && (
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
              Category: {filters.category}
              <button
                onClick={() => handleFilterChange('category', undefined)}
                className="ml-1 text-blue-600 hover:text-blue-800"
              >
                ×
              </button>
            </span>
          )}
          {filters.maxPrice && (
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
              Max Price: ${filters.maxPrice}
              <button
                onClick={() => handleFilterChange('maxPrice', undefined)}
                className="ml-1 text-blue-600 hover:text-blue-800"
              >
                ×
              </button>
            </span>
          )}
          {filters.isAvailable !== undefined && (
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
              {filters.isAvailable ? 'Available Only' : 'Unavailable Only'}
              <button
                onClick={() => handleFilterChange('isAvailable', undefined)}
                className="ml-1 text-blue-600 hover:text-blue-800"
              >
                ×
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  )
}

export default CarFiltersComponent
