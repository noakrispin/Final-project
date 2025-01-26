import { api } from "./api"; // Import the shared API utilities

export const gradesApi = {
  /**
   * Add or update a grade by its ID.
   * 
   * @param {string} id - The unique ID of the grade document.
   * @param {Object} data - The payload containing evaluatorID, formID, and grades.
   */
  addOrUpdateGrade: async (data) => {
    console.log("Adding/updating grade...");
    console.log("Received data:", data);
  
    // Ensure the required fields are present
    const { studentID, projectCode, grade, formID } = data;
    if (!studentID || !projectCode || grade === undefined || !formID) {
      throw new Error("Missing required fields: studentID, projectCode, grade, or formID.");
    }
  
    try {
      // Make the API request to the backend
      const response = await api.post(`/grades`, data);
      console.log("Response from addOrUpdateGrade:", response.data);
      return response.data;
    } catch (error) {
      console.error(
        "Error adding/updating grade:",
        error.response?.data || error.message
      );
      throw new Error(
        `Failed to update grade: ${
          error.response?.data?.error?.message || error.message
        }`
      );
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
