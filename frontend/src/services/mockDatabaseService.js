// This simulates a database connection and can be replaced with real DB later
let projectsData = [];
let uploadedProjectsData = []; // Separate storage for uploaded projects

export const mockDatabaseService = {
  insertProjects: async (projects) => {
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Add IDs to projects (project code comes from Excel)
      const projectsWithIds = projects.map((project, index) => ({
        ...project,
        id: `uploaded-${Date.now()}-${index}`
      }));

      // Store in both general and uploaded projects
      projectsData = [...projectsData, ...projectsWithIds];
      uploadedProjectsData = [...uploadedProjectsData, ...projectsWithIds];

      return projectsWithIds;
    } catch (error) {
      throw new Error('Database error: ' + error.message);
    }
  },

  getProjects: async () => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return projectsData;
  },

  getUploadedProjects: async () => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return uploadedProjectsData;
  },

  clearUploadedProjects: async () => {
    // Method to clear uploaded projects if needed
    uploadedProjectsData = [];
    return true;
  }
};

