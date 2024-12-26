import React, { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, Settings2 } from 'lucide-react';
import { Button } from "./Button";
import { ColumnManagementDialog } from './ColumnManagementDialog';
import { sortData } from "../../utils/sortData";
import SearchBar from "../shared/SearchBar"; 

const FILTERS = ['All', 'Part A', 'Part B'];

export const Table = ({ data, columns, className = '', onRowClick }) => {
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [columnWidths, setColumnWidths] = useState({});
  const [isResizing, setIsResizing] = useState(false);
  const [isColumnManagementOpen, setIsColumnManagementOpen] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState(columns.map(col => col.key));

  const handleSort = (columnKey) => {
    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
  };

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const matchesSearch = Object.values(item).some(
        (val) =>
          typeof val === 'string' &&
          val.toLowerCase().includes(searchTerm.toLowerCase())
      );

      if (selectedFilter === 'All') return matchesSearch;
      return matchesSearch && item.part === selectedFilter.split(' ')[1];
    });
  }, [data, searchTerm, selectedFilter]);

  const sortedData = useMemo(() => {
    return sortData(filteredData, columns, sortColumn, sortDirection);
  }, [filteredData, sortColumn, sortDirection, columns]);

  const visibleColumnsList = columns.filter(col => visibleColumns.includes(col.key));

  const handleRestoreDefaults = () => {
    setVisibleColumns(columns.map(col => col.key));
  };

  return (
    <div className="space-y-4">
      {/* Filters and Search Bar */}
      <div className="flex items-center justify-between mb-4 px-6">
        {/* Filter Buttons */}
        <div className="flex space-x-2 ">
          {FILTERS.map((filter) => (
            <button
              key={filter}
              onClick={() => setSelectedFilter(filter)}
              className={`px-4 py-2 rounded-full text-base font-medium ${
                selectedFilter === filter
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* SearchBar */}
        <div >
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search"
          />
        </div>
      </div>

      {/* Table */}
      <div className={`w-full overflow-auto rounded-lg border border-[#e5e7eb] bg-white ${className}`}>
        <div className="min-w-full align-middle">
          <table className="min-w-full divide-y divide-[#e5e7eb]">
            <thead>
              <tr className="bg-white">
                {visibleColumnsList.map((column) => (
                  <th
                    key={column.key}
                    scope="col"
                    className={`relative px-6 py-4 text-left text-base font-medium text-[#313131] ${
                      column.sortable ? 'cursor-pointer select-none' : ''
                    } group`}
                    style={{ width: columnWidths[column.key] }}
                  >
                    <div 
                      className="flex items-center gap-2"
                      onClick={() => column.sortable && handleSort(column.key)}
                    >
                      {column.header}
                      {column.sortable && (
                        <span className="inline-flex flex-col">
                          <ChevronUp
                            className={`h-3 w-3 ${
                              sortColumn === column.key && sortDirection === 'asc'
                                ? 'text-[#313131]'
                                : 'text-gray-300'
                            }`}
                          />
                          <ChevronDown
                            className={`h-3 w-3 -mt-1 ${
                              sortColumn === column.key && sortDirection === 'desc'
                                ? 'text-[#313131]'
                                : 'text-gray-300'
                            }`}
                          />
                        </span>
                      )}
                    </div>

                    <div
                      className={`absolute right-0 top-0 h-full flex items-center cursor-col-resize`}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        const startX = e.pageX;
                        const startWidth = e.currentTarget.parentElement.offsetWidth;
                        setIsResizing(true);

                        const handleMouseMove = (e) => {
                          const diff = e.pageX - startX;
                          const newWidth = Math.max(100, startWidth + diff);
                          setColumnWidths(prev => ({
                            ...prev,
                            [column.key]: `${newWidth}px`
                          }));
                        };

                        const handleMouseUp = () => {
                          setIsResizing(false);
                          document.removeEventListener('mousemove', handleMouseMove);
                          document.removeEventListener('mouseup', handleMouseUp);
                        };

                        document.addEventListener('mousemove', handleMouseMove);
                        document.addEventListener('mouseup', handleMouseUp);
                      }}
                    >
                      <div className={`w-4 flex justify-center ${isResizing ? 'cursor-col-resize' : ''}`}>
                        <div className={`w-[1px] h-full bg-gray-200/40 transform scale-x-[0.5] ${
                          isResizing ? 'bg-blue-400' : 'hover:bg-blue-400'
                        }`} />
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5e7eb] bg-white">
              {sortedData.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className="hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => onRowClick && onRowClick(row)}
                >
                  {visibleColumnsList.map((column) => (
                    <td
                      key={column.key}
                      className="px-6 py-4 text-base text-[#686b80]"
                      style={{ width: columnWidths[column.key] }}
                    >
                      {column.render ? column.render(row[column.key], row) : row[column.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsColumnManagementOpen(true)}
          className="text-gray-500 hover:text-gray-700"
        >
          <Settings2 className="mr-2 h-4 w-4" />
          Show/Hide Columns
        </Button>
      </div>

      <ColumnManagementDialog
        isOpen={isColumnManagementOpen}
        onClose={() => setIsColumnManagementOpen(false)}
        columns={columns}
        visibleColumns={visibleColumns}
        onApply={setVisibleColumns}
        onRestore={handleRestoreDefaults}
      />
    </div>
  );
};
