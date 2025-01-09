import { useState, useEffect } from 'react';
import { mockApi } from '../services/mockApi';

export const useTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setIsLoading(true);
        const tasksData = await mockApi.getTasks();
        setTasks(tasksData);
      } catch (err) {
        console.error('Error fetching tasks:', err);
        setError('Failed to fetch tasks. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const addTask = async (newTask) => {
    try {
      const addedTask = await mockApi.addTask(newTask);
      setTasks(prevTasks => [...prevTasks, addedTask]);
    } catch (err) {
      console.error('Error adding task:', err);
      setError('Failed to add task. Please try again later.');
    }
  };

  return { tasks, addTask, isLoading, error };
};