import React from 'react';
import { Table } from '../ui/Table';
import { Input } from '../ui/Input';

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
}) => {
  const activeFilter = filterState ? filterState[0] : null;
  const setActiveFilter = filterState ? filterState[1] : null;
  const searchTerm = searchState ? searchState[0] : '';
  const setSearchTerm = searchState ? searchState[1] : null;

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        <p className="mt-1 text-sm text-gray-500">{description}</p>
        
        {progressBar}

        <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {filters && setActiveFilter && (
            <div className="flex flex-wrap gap-2">
              {filters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    activeFilter === filter
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
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
              />
            </div>
          )}
        </div>
      </div>

      <div className="mt-4">
        <Table
          columns={tableColumns}
          data={tableData}
          onRowClick={onRowClick} // Pass onRowClick to Table
          rowClassName={rowClassName} // Pass rowClassName to Table
        />
      </div>
    </div>
  );
};
