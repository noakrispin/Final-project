import React from 'react';
import { Button } from '../ui/Button';
import { Table } from '../ui/Table';
import { SearchBar } from '../shared/SearchBar';

export const Section = React.memo(({ title, description, filters, filterState, searchState, tableData, tableColumns }) => {
  const [filter, setFilter] = filterState;
  const [search, setSearch] = searchState;

  return (
    <div className="mb-6 md:mb-8">
      <h2 className="text-2xl md:text-3xl font-bold text-black mb-2 md:mb-3">{title}</h2>
      <p className="text-gray-600 text-sm md:text-base mb-4 md:mb-5 max-w-2xl">{description}</p>

      <div className="space-y-3 md:space-y-4">
        <div className="flex flex-wrap gap-2">
          {filters.map(filterOption => (
            <Button
              key={filterOption}
              onClick={() => setFilter(filterOption)}
              variant={filter === filterOption ? 'default' : 'outline'}
              size="sm"
            >
              {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
            </Button>
          ))}
        </div>

        <SearchBar value={search} onChange={setSearch} placeholder={`Search ${title.toLowerCase()}...`} />

        <div className="overflow-x-auto">
          <Table 
            data={tableData} 
            columns={tableColumns}
            className="w-full"
            thClassName="text-lg font-medium text-[#313131] px-6 py-4"
            tdClassName="text-lg text-[#686b80] px-6 py-4"
          />
        </div>
      </div>
    </div>
  );
});

