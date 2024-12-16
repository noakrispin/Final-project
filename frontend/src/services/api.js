import myProject from '../data/myProject.json';
import mockUsers from '../data/mockUsers.json';

export const api = {
  getProjects: async () => {
    // Simulating API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return myProject.map(project => ({
      ...project,
      presentationGrade: project.presentationGrade || null,
      supervisorGrade: project.supervisorGrade || null,
      bookGrade: project.bookGrade || null,
    }));
  },

  getGrades: async () => {
    // Simulating API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    // Import grades data
    const grades = await import('../data/grades.json');
    return grades.default;
  },

  getUsers: async () => {
    // Simulating API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockUsers;
  },

  getTasks: async () => {
    // Simulating API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    // Derive tasks from projects
    return myProject.flatMap(project => [
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
  }
};

