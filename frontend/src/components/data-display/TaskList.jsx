import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '../ui/Button';

export const TaskList = ({ selectedDate }) => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({ title: '', date: '' });
  const [displayedTasks, setDisplayedTasks] = useState(3);

  // Fetch tasks from the database
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/tasks');
        if (!response.ok) {
          throw new Error('Failed to fetch tasks');
        }
        const data = await response.json();
        setTasks(data);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    };

    fetchTasks();
  }, []);

  const handleNewTaskSubmit = async (e) => {
    e.preventDefault();
    if (newTask.title && newTask.date) {
      try {
        const response = await fetch('http://localhost:3001/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            task_title: newTask.title,
            task_due_date: newTask.date,
            task_status: 'Pending', // Default value
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to add task');
        }

        const createdTask = await response.json();
        setTasks((prevTasks) => [...prevTasks, createdTask]);
        setNewTask({ title: '', date: '' });
      } catch (error) {
        console.error('Error adding task:', error);
      }
    }
  };

  const tasksForSelectedDate = selectedDate
    ? tasks.filter(
        (task) =>
          new Date(task.task_due_date).toDateString() ===
          selectedDate.toDateString()
      )
    : tasks;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4 text-primary">Task List</h2>
      <div className="space-y-4">
        <form onSubmit={handleNewTaskSubmit}>
          <input
            type="text"
            value={newTask.title}
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            placeholder="Task Title"
            className="w-full p-2 border rounded mb-2"
          />
          <input
            type="date"
            value={newTask.date}
            onChange={(e) => setNewTask({ ...newTask, date: e.target.value })}
            className="w-full p-2 border rounded mb-2"
          />
          <Button type="submit">
            <Plus className="w-4 h-4 mr-2" />
            Add Task
          </Button>
        </form>
        <div>
          <h3 className="text-sm font-medium text-red-600 mb-2">
            {selectedDate ? `Tasks for ${selectedDate.toDateString()}` : 'All Tasks'}
          </h3>
          {tasksForSelectedDate.slice(0, displayedTasks).map((task) => (
            <div key={task.taskID} className="p-3 bg-gray-50 rounded-lg mb-2">
              <p className="text-sm font-medium">{task.task_title}</p>
              <p className="text-xs text-gray-500">
                {new Date(task.task_due_date).toDateString()}
              </p>
              <p className="text-xs text-blue-600">{task.task_status}</p>
            </div>
          ))}
          {tasksForSelectedDate.length > 3 && (
            <Button
              onClick={() =>
                setDisplayedTasks((prevDisplayed) =>
                  prevDisplayed === 3 ? tasksForSelectedDate.length : 3
                )
              }
              className="mt-2 w-full"
            >
              {displayedTasks === 3 ? 'Show More' : 'Show Less'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
