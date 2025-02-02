import { api } from "./api"; 

export const gradesApi = {
  /**
   * Add or update a grade. - this is the main logic in refresh grades - its calculating all final grades 
   */
  addOrUpdateGrade: async (projectCode, data) => {
    try {
      const response = await api.post("/grades", { projectCode, ...data });
      return response;
    } catch (error) {
      console.error("Error adding/updating grade:", error);
      throw error;
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