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
