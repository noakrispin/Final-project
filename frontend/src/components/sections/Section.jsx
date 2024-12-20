import React from 'react';
import { Table } from '../ui/Table';
import { Input } from '../ui/Input';
import { Loader2 } from 'lucide-react';
import { sectionPropTypes } from '../../utils/prop-types';
import { cn } from '../../lib/utils';

export const Section = ({
  title,
  description,
  filters,
  filterState,
  searchState,
  progressBar,
  tableData,
  tableColumns,
  onRowClick, // Accept onRowClick as a prop
  rowClassName, // Accept rowClassName as a prop
  isLoading = false,
  error = null,
  className,
}) => {
  const activeFilter = filterState ? filterState[0] : null;
  const setActiveFilter = filterState ? filterState[1] : null;
  const searchTerm = searchState ? searchState[0] : '';
  const setSearchTerm = searchState ? searchState[1] : null;

  // Handle keyboard navigation for filters
  const handleKeyDown = (e, filter) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setActiveFilter(filter);
    }
  };

  return (
    <section 
      className={cn("bg-white rounded-lg shadow", className)}
      aria-labelledby="section-title"
    >
      <div className="px-6 py-4">
        <h2 
          id="section-title" 
          className="text-2xl font-bold text-gray-900"
        >
          {title}
        </h2>
        
        {description && (
          <p className="mt-1 text-sm text-gray-500">
            {description}
          </p>
        )}
        
        {progressBar}

        <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {filters && setActiveFilter && (
            <div 
              className="flex flex-wrap gap-2"
              role="radiogroup"
              aria-label="Filter options"
            >
              {filters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  onKeyDown={(e) => handleKeyDown(e, filter)}
                  className={cn(
                    "px-3 py-1 rounded-full text-sm font-medium transition-colors",
                    "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                    activeFilter === filter
                      ? "bg-primary text-primary-foreground"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  )}
                  role="radio"
                  aria-checked={activeFilter === filter}
                  tabIndex={0}
                >
                  {filter}
                </button>
              ))}
            </div>
          )}

          {setSearchTerm && (
            <div className="w-full sm:w-64">
              <Input
                type="search"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
                aria-label="Search projects"
              />
            </div>
          )}
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div 
          className="px-6 py-4 text-sm text-red-600 bg-red-50"
          role="alert"
        >
          {error}
        </div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="px-6 py-8 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : (
        /* Table */
        <div className="mt-4">
          <Table 
            columns={tableColumns} 
            data={tableData}
            onRowClick={onRowClick} // Pass onRowClick to Table
            rowClassName={rowClassName} // Pass rowClassName to Table
            aria-label={`${title} table`}
          />
        </div>
      )}
    </section>
  );
};

Section.propTypes = sectionPropTypes;
Section.displayName = 'Section';
