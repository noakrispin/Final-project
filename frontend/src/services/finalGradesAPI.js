import { api } from "./api"; // Import the shared API utilities

export const gradesApi = {
  /**
   * Add or update a grade by its ID.
   * 
   * @param {string} id - The unique ID of the grade document.
   * @param {Object} data - The payload containing evaluatorID, formID, and grades.
   */
  addOrUpdateGrade: async (data) => {
    console.log("Adding/updating grades...");
    console.log("Received data:", data);
  
    // Ensure the required fields are present
    const { projectCode, evaluationsByForm } = data;
    if (!projectCode || !evaluationsByForm || evaluationsByForm.length === 0) {
      throw new Error("Missing required fields: projectCode or evaluationsByForm.");
    }
  
    try {
      // Make the API request to the backend
      const response = await api.post(`/grades`, data);
      console.log("Response from addOrUpdateGrade:", response);
      return response;
    } catch (error) {
      console.error(
        "Error adding/updating grades:",
        error.response?.data || error.message
      );
      throw new Error(
        `Failed to update grades: ${
          error.response?.data?.error?.message || error.message
        }`
      );
    }
  },
  
   getGradesForProjects : async (projectCodes) => {
    try {
      const response = await api.post("/grades/supervisor", { projectCodes });
      return response.data.data || [];
    } catch (error) {
      console.error("Error fetching grades:", error);
      return [];
    }
  },
  
  
  /**
   * Get a specific grade by ID.
   */
  getGrade: async (id) => {
    try {
      const response = await api.get(`/grades/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching grade:", error);
      throw error;
    }
  },

  /**
   * Get all grades.
   */
  getAllGrades: async () => {
    try {
      const response = await api.get(`/grades`);
      return response.data;
    } catch (error) {
      console.error("Error fetching all grades:", error);
      throw error;
    }
  },

  /**
   * Delete a specific grade by ID.
   */
  deleteGrade: async (id) => {
    try {
      const response = await api.delete(`/grades/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting grade:", error);
      throw error;
    }
  },
};
