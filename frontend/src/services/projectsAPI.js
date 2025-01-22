import { api } from "./api"; // Import the shared API utilities

export const projectsApi = {
  /**
   * Add a new project.
   * @param {string} projectCode - The unique code for the project.
   * @param {object} data - The project data to add.
   */
  addProject: async (projectCode, data) => {
    try {
      const response = await api.post("/projects", { projectCode, data });
      return response.data;
    } catch (error) {
      console.error("Error adding project:", error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Get details of a specific project by project code.
   * @param {string} projectCode - The unique code for the project.
   */
  getProject: async (projectCode) => {
    try {
      console.log("Fetching project with projectCode:", projectCode);
      const response = await api.get(`/projects/${projectCode}`);
      console.log("Full response:", response);
      return response.data || response; // Adjust based on the actual structure
    } catch (error) {
      console.error("Error fetching project:", error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Get all projects.
   */
  getAllProjects : async () => {
    try {
      const response = await fetch("http://localhost:3001/api/projects");
      const rawData = await response.json();
  
      // Ensure the response is an array
      if (!Array.isArray(rawData)) {
        console.error("Unexpected API Response: Not an array");
        throw new Error("Projects data is not an array");
      }
  
      console.log("Raw Response:", rawData); // Debug log
      console.log("Parsed Response Data:", rawData); // Correctly parsed array
  
      return rawData; // Return the projects array
    } catch (error) {
      console.error("Error fetching projects:", error.message);
      throw error;
    }
  },
  

  /**
   * Update a specific project by project code.
   * @param {string} projectCode - The unique code for the project.
   * @param {object} data - The updated project data.
   */
  updateProject: async (projectCode, data) => {
    try {
      const response = await api.put(`/projects/${projectCode}`, data);
      return response.data;
    } catch (error) {
      console.error("Error updating project:", error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Delete a specific project by project code.
   * @param {string} projectCode - The unique code for the project.
   */
  deleteProject: async (projectCode) => {
    try {
      const response = await api.delete(`/projects/${projectCode}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting project:", error.response?.data || error.message);
      throw error;
    }
  },
};
