import { api } from "./api"

export const projectsApi = {
  /**
   * Add a new project.
   * @param {string} projectCode - The unique code for the project.
   * @param {object} data - The project data to add.
   */
  addProject: async (projectCode, data) => {
    try {
      const response = await api.post("/projects", { projectCode, data })
      return response
    } catch (error) {
      console.error("Error adding project:", error.response?.data || error.message)
      throw error
    }
  },

  /**
   * Get details of a specific project by project code.
   * @param {string} projectCode - The unique code for the project.
   */
  getProject: async (projectCode) => {
    try {
      console.log("Fetching project with projectCode:", projectCode)
      const response = await api.get(`/projects/${projectCode}`)
      console.log("Full response:", response)
      return response
    } catch (error) {
      console.error("Error fetching project:", error.response?.data || error.message)
      throw error
    }
  },


  getProjectsBySupervisor : async (supervisorEmail) => {
    try {
      const response = await fetch(`/api/projects/supervisor/${encodeURIComponent(supervisorEmail)}`);
      if (!response.ok) throw new Error("Failed to fetch supervised projects.");
      return await response.json();
    } catch (error) {
      console.error("Error fetching supervised projects:", error);
      return [];
    }
  },
  

  /**
   * Get all projects.
   */
  getAllProjects: async () => {
    try {
      const response = await api.get("/projects")

      // Log the raw response for debugging
      console.log("Raw API Response:", response)

      // Since we're using fetch, the response is already JSON parsed
      // and should be the array directly
      if (!Array.isArray(response)) {
        console.error("Unexpected API Response Structure:", response)
        return [] // Return empty array as fallback
      }

      return response
    } catch (error) {
      console.error("Error fetching projects:", error)
      throw error
    }
  },

  /**
   * Update a specific project by project code.
   * @param {string} projectCode - The unique code for the project.
   * @param {object} data - The updated project data.
   */
  updateProject: async (projectCode, data) => {
    try {
      const response = await api.put(`/projects/${projectCode}`, data)
      return response
    } catch (error) {
      console.error("Error updating project:", error.response?.data || error.message)
      throw error
    }
  },

  /**
   * Delete a specific project by project code.
   * @param {string} projectCode - The unique code for the project.
   */
  deleteProject: async (projectCode) => {
    try {
      const response = await api.delete(`/projects/${projectCode}`)
      return response
    } catch (error) {
      console.error("Error deleting project:", error.response?.data || error.message)
      throw error
    }
  },
}

