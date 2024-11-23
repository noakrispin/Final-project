import { mockUsers } from '../mocks/mockUsers';
import { mockProjects } from '../mocks/mockProjects';
import { mockProjectRequests } from '../mocks/mockProjectRequests';

export const api = {
  getUsers: async () => {
    // Simulating API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockUsers;
  },

  getTasks: async () => {
    // Simulating API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    // Derive tasks from projects
    return mockProjects.flatMap(project => [
      { id: `${project.id}-grade`, title: `Grade ${project.title}`, deadline: project.deadline, priority: 'high', type: 'grading', projectId: project.id },
      { id: `${project.id}-feedback`, title: `Provide Feedback for ${project.title}`, deadline: project.deadline, priority: 'high', type: 'feedback', projectId: project.id }
    ]);
  },

  addTask: async (newTask) => {
    // Simulating API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    const tasks = await api.getTasks();
    const task = { ...newTask, id: Math.max(...tasks.map(t => parseInt(t.id))) + 1 };
    tasks.push(task);
    return task;
  },

  getProjects: async () => {
    // Simulating API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockProjects;
  },

  getProjectRequests: async () => {
    // Simulating API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockProjectRequests;
  },

  updateProjectRequest: async (projectId, action) => {
    // Simulating API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    const index = mockProjectRequests.findIndex(req => req.id === projectId);
    if (index !== -1) {
      mockProjectRequests[index].status = action;
    }
    return mockProjectRequests[index];
  }
};