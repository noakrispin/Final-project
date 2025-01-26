import { api } from "./api"; // Import the shared API utilities

export const gradesApi = {
  /**
   * Add or update a grade by its ID.
   * 
   * @param {string} id - The unique ID of the grade document.
   * @param {Object} data - The payload containing evaluatorID, formID, and grades.
   */
  addOrUpdateGrade: async (id, data) => {
    console.log("Adding/updating grade...");
    console.log("Using grade ID:", id);
    console.log("Received data:", data);

    if (!id || !data) {
      throw new Error("Grade ID and data are required for updating a grade.");
    }

    try {
      // Make the API request to the backend
      const response = await api.post(`/grades/${id}`, data);
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
