/**
 * This module provides a data context for managing and fetching application data.
 * It includes the following functionalities:
 * 
 * 1. DataProvider component:
 *    - Manages the data state.
 *    - Fetches data from an API endpoint on initial load and at regular intervals.
 *    - Provides the fetched data to its children components.
 * 
 * 2. useData hook:
 *    - Custom hook to access the data context.
 * 
 * The module uses React's Context API and useEffect for data fetching and state management.
 */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/api/data/endpoint');
        setData(response);
        console.log('Data fetched:', response);
      } catch (error) {
        console.error('Error fetching data:', error.message);
      }
    };

    fetchData(); // Initial fetch

    const intervalId = setInterval(fetchData, 300000); // Refresh every 5 minutes

    return () => clearInterval(intervalId); // Cleanup
  }, []);

  return <DataContext.Provider value={data}>{children}</DataContext.Provider>;
};

export const useData = () => useContext(DataContext);
