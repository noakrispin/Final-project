import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '../ui/Button';

export const TaskList = ({ tasks, addTask, selectedDate }) => {
  const [newTask, setNewTask] = useState({ title: '', date: '' });
  const [displayedTasks, setDisplayedTasks] = useState(3);

  const handleNewTaskSubmit = (e) => {
    e.preventDefault();
    if (newTask.title && newTask.date) {
      addTask({
        title: newTask.title,
        deadline: new Date(newTask.date),
        priority: 'medium',
        type: 'custom'
      });
      setNewTask({ title: '', date: '' });
    }
  };

  const tasksForSelectedDate = selectedDate
    ? tasks.filter(task => new Date(task.deadline).toDateString() === selectedDate.toDateString())
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
            <div
              key={task.id}
              className="p-3 bg-gray-50 rounded-lg mb-2"
            >
              <p className="text-sm font-medium">{task.title}</p>
              <p className="text-xs text-gray-500">{new Date(task.deadline).toDateString()}</p>
              <p className="text-xs text-blue-600">{task.type}</p>
            </div>
          ))}
          {tasksForSelectedDate.length > 3 && (
            <Button
              onClick={() => setDisplayedTasks(prevDisplayed => 
                prevDisplayed === 3 ? tasksForSelectedDate.length : 3
              )}
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