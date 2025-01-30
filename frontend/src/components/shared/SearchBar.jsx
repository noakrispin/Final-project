import React from 'react';
import { Search } from 'lucide-react';

const SearchBar = ({ value, onChange, placeholder }) => (
  <div className="relative">
    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" />
    <input
      type="text"
      placeholder={placeholder}
      className="w-full h-10 pl-9 pr-3 bg-gray-200 rounded-md font-semibold text-base border border-gray-700"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

export default SearchBar;
