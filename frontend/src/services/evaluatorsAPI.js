import { api } from "./api"; // Import the shared API utilities

export const evaluatorsApi = {
  /**
   * Add or update an evaluator.
   *
   * This function sends a request to add or update an evaluator in the backend.
   *
   * @param {Object} data - The evaluator data to add or update.
   * @returns {Promise<Object>} The response data from the API.
   * @throws {Error} If the request fails.
   */
  addOrUpdateEvaluator: async (data) => {
    try {
      const response = await api.post("/evaluators", data);
      return response.data;
    } catch (error) {
      console.error("Error adding/updating evaluator:", error);
      throw error;
    }
  },

  /**
   * Get details of a specific evaluator by ID.
   *
   * This function fetches the details of an evaluator by their ID.
   *
   * @param {string} id - The ID of the evaluator to fetch.
   * @returns {Promise<Object>} The response data from the API.
   * @throws {Error} If the request fails.
   */
  getEvaluator: async (id) => {
    try {
      const response = await api.get(`/evaluators/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching evaluator:", error);
      throw error;
    }
  },

  /**
   * Get all evaluators.
   *
   * This function fetches all evaluators from the backend.
   *
   * @returns {Promise<Object[]>} The response data from the API.
   * @throws {Error} If the request fails.
   */
  getAllEvaluators: async () => {
    try {
      const response = await api.get("/evaluators");
      return response.data;
    } catch (error) {
      console.error("Error fetching all evaluators:", error);
      throw error;
    }
  },

  /**
   * Delete a specific evaluator by ID.
   *
   * This function sends a request to delete an evaluator by their ID.
   *
   * @param {string} id - The ID of the evaluator to delete.
   * @returns {Promise<Object>} The response data from the API.
   * @throws {Error} If the request fails.
   */
  deleteEvaluator: async (id) => {
    try {
      const response = await api.delete(`/evaluators/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting evaluator:", error);
      throw error;
    }
  },

  /**
   * Get all projects assigned to a particular evaluator by ID.
   *
   * This function fetches all projects assigned to a specific evaluator.
   *
   * @param {string} evaluatorID - The ID of the evaluator to fetch projects for.
   * @returns {Promise<Object[]>} The response data from the API.
   * @throws {Error} If the request fails.
   */
  getProjectsByEvaluator: async (evaluatorID) => {
    try {
      const response = await api.get(`/evaluators/projects/${evaluatorID}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching projects for evaluator:", error);
      throw error;
    }
  },

  /**
   * Get all evaluators assigned to a specific project.
   *
   * This function fetches all evaluators assigned to a specific project.
   *
   * @param {string} projectCode - The code of the project to fetch evaluators for.
   * @returns {Promise<Object[]>} The response data from the API.
   * @throws {Error} If the request fails.
   */
  getEvaluatorsByProject: async (projectCode) => {
    try {
      const response = await api.get(`/evaluators/project/${projectCode}/evaluators`);
      return response.data;
    } catch (error) {
      console.error("Error fetching evaluators for project:", error);
      throw error;
    }
  },

  /**
   * Get all projects assigned to a particular evaluator by form ID.
   *
   * This function fetches all projects assigned to a specific evaluator by form ID.
   *
   * @param {string} evaluatorID - The ID of the evaluator to fetch projects for.
   * @param {string} formID - The ID of the form to filter projects by.
   * @returns {Promise<Object[]>} The response data from the API.
   * @throws {Error} If the request fails.
   */
  getProjectsForEvaluatorByForm: async (evaluatorID, formID) => {
    try {
      const response = await api.get(`/evaluators/${evaluatorID}/projects/${formID}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching projects for evaluator:", error.message);
      throw error;
    }
  },
};
