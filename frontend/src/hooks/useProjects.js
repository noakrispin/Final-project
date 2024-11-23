import { useState, useEffect } from 'react';
import { api } from '../services/api';

export const useProjects = () => {
  const [projects, setProjects] = useState([]);
  const [projectRequests, setProjectRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setIsLoading(true);
        const [projectsData, requestsData] = await Promise.all([
          api.getProjects(),
          api.getProjectRequests()
        ]);
        setProjects(projectsData || []);
        setProjectRequests(requestsData || []);
      } catch (err) {
        console.error('Error fetching projects:', err);
        setError('Failed to fetch projects. Please try again later.');
        setProjects([]);
        setProjectRequests([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, []);

  return { projects, projectRequests, isLoading, error };
};