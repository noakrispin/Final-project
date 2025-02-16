import { api } from "./api"; 

export const gradesApi = {
  /**
   * Add or update a grade.
   * This is the main logic in refresh grades - it calculates all final grades.
   *
   * @param {string} projectCode - The code of the project to add or update the grade for.
   * @param {Object} data - The grade data to add or update.
   * @returns {Promise<Object>} The response data from the API.
   * @throws {Error} If the request fails.
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
   *
   * @param {string} id - The ID of the grade to fetch.
   * @returns {Promise<Object>} The response data from the API.
   * @throws {Error} If the request fails.
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
   *
   * @returns {Promise<Object[]>} The response data from the API.
   * @throws {Error} If the request fails.
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
   *
   * @param {string} id - The ID of the grade to delete.
   * @returns {Promise<Object>} The response data from the API.
   * @throws {Error} If the request fails.
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