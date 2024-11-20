import { useState, useEffect } from 'react';

export const useProjects = () => {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        // Replace this with your actual API call
        const response = await fetch('https://api.example.com/projects');
        if (!response.ok) {
          throw new Error('Failed to fetch projects');
        }
        const data = await response.json();
        setProjects(data);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching projects:', err);
        setError(err.message || 'Failed to fetch projects');
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, []);

  return {
    projects,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    filter,
    setFilter,
  };
};