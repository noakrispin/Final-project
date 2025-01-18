import { api } from "./api"; // Import the shared API utilities

export const formsApi = {
  /**
   * Get a specific form by ID.
   */
  getForm: async (formID) => {
    return await api.get(`/forms/${formID}`);
  },

  /**
   * Update a specific form by ID.
   */
  updateForm: async (formID, updatedData) => {
    return await api.put(`/forms/${formID}`, updatedData);
  },

  /**
   * Get all questions for a specific form.
   */
  getQuestions: async (formID) => {
    try {
      const response = await fetch(`http://localhost:3001/api/forms/${formID}/questions`);
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching questions:", error);
      throw error;
    }
  },
  
  


  /**
   * Add a new question to a specific form.
   */
  addQuestion: async (formID, questionData) => {
    return await api.post(`/forms/${formID}/questions`, questionData);
  },

  /**
   * Update a specific question in a form.
   */
  updateQuestion: async (formID, questionId, updatedData) => {
    return await api.put(`/forms/${formID}/questions/${questionId}`, updatedData);
  },

  /**
   * Delete a specific question from a form.
   */
  deleteQuestion: async (formID, questionId) => {
    return await api.delete(`/forms/${formID}/questions/${questionId}`);
  },

  /**
   * Submit a form with the given data.
   * @param {string} formID - The ID of the form to submit.
   * @param {object} formData - The data to submit for the form.
   */
  submitForm: async (formID, formData) => {
    return await api.post(`/forms/${formID}/submit`, formData);
  },

  /**
   * Fetch all responses for a specific form.
   */
  getResponses: async (formID) => {
    return await api.get(`/forms/${formID}/responses`);
  },

  /**
   * Update a specific response in a form.
   */
  updateResponse: async (formID, responseId, updatedData) => {
    return await api.put(`/forms/${formID}/responses/${responseId}`, updatedData);
  },

  /**
   * Delete a specific response from a form.
   */
  deleteResponse: async (formID, responseId) => {
    return await api.delete(`/forms/${formID}/responses/${responseId}`);
  },

  /**
   * Fetch all evaluations for a specific form.
   */
  getEvaluations: async (formID) => {
    return await api.get(`/forms/${formID}/evaluations`);
  },

  /**
   * Update a specific evaluation in a form.
   */
  updateEvaluation: async (formID, evaluationId, updatedData) => {
    return await api.put(`/forms/${formID}/evaluations/${evaluationId}`, updatedData);
  },

  /**
   * Delete a specific evaluation from a form.
   */
  deleteEvaluation: async (formID, evaluationId) => {
    return await api.delete(`/forms/${formID}/evaluations/${evaluationId}`);
  },

  /**
   * Fetch evaluations for a specific evaluator.
   */
  getEvaluationsByEvaluator: async (evaluatorID) => {
    if (!evaluatorID) {
      console.error("Evaluator ID is missing in the API call.");
      throw new Error("Evaluator ID is required.");
    }

    try {
      console.log("Fetching evaluations for evaluator:", evaluatorID); // Debugging log
      const response = await api.get(`/forms/evaluations/all?evaluatorID=${evaluatorID}`);
      console.log("Request URL:", `/forms/evaluations/all?evaluatorID=${evaluatorID}`); // Log the full URL
      console.log("Fetched Evaluations Data:", response.data || []); // Log response data
      return response.data; // Return fetched evaluations
    } catch (error) {
      console.error(
        "Error fetching evaluations by evaluator:",
        error.response?.data || error.message
      );
      throw error; // Re-throw to handle in calling code
    }
  },




  /**
   * Add a new evaluation for a specific form.
   */
  addEvaluation: async (formID, evaluationData) => {
    try {
      const response = await api.post(`/forms/${formID}/evaluations`, evaluationData);
      return response.data;
    } catch (error) {
      console.error("Error adding evaluation:", error.response?.data || error.message);
      throw error;
    }
  },
};

