import React, { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

export const Table = ({ data, columns, className = '', onRowClick }) => {
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');

  const handleSort = (columnKey) => {
    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
  };

  const sortedData = React.useMemo(() => {
    if (sortColumn) {
      return [...data].sort((a, b) => {
        if (a[sortColumn] < b[sortColumn]) return sortDirection === 'asc' ? -1 : 1;
        if (a[sortColumn] > b[sortColumn]) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return data;
  }, [data, sortColumn, sortDirection]);

  return (
    <div className="w-full overflow-auto rounded-lg border border-[#e5e7eb] bg-white">
      <div className="min-w-full align-middle">
        <table className="min-w-full divide-y divide-[#e5e7eb]">
          <thead>
            <tr className="bg-white">
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={`px-6 py-4 text-left text-base font-medium text-[#313131] ${
                    column.sortable ? 'cursor-pointer select-none' : ''
                  } ${column.key === 'gradeStatus' || column.key === 'feedbackStatus' ? 'whitespace-nowrap min-w-[140px]' : ''}`}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center gap-2">
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
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e5e7eb] bg-white">
            {sortedData.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className="hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => onRowClick && onRowClick(row)} // Make row clickable
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={`px-6 py-4 text-base text-[#686b80] ${
                      column.key === 'gradeStatus' || column.key === 'feedbackStatus' ? 'whitespace-nowrap' : ''
                    }`}
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
  );
};

export const TableHeader = ({ children }) => <thead>{children}</thead>;
export const TableBody = ({ children }) => <tbody>{children}</tbody>;
export const TableRow = ({ children, ...props }) => <tr {...props}>{children}</tr>;
export const TableHead = ({ children }) => <th>{children}</th>;
export const TableCell = ({ children }) => <td>{children}</td>;
