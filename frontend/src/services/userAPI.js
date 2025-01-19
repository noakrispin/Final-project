import { api } from "./api"; // Import the shared API utilities

export const userApi = {
  /**
   * Add a new user to the database.
   * @param {object} userData - The user details (id, fullName, email, role, password, supervisorTopics).
   */
  addUser: async (userData) => {
    try {
      const response = await api.post("/users", userData);
      return response.data;
    } catch (error) {
      console.error("Error adding user:", error);
      throw error;
    }
  },

  /**
   * Fetch a user's details along with subcollections.
   * @param {string} userId - The ID of the user to fetch.
   */
  getUser: async (userId) => {
    try {
      const response = await api.get(`/users/${userId}`);
      if (response.data.success) {
        return {
          fullName: response.data.data.fullName, // Extract fullName
          role: response.data.data.role,
          supervisorDetails: response.data.data.supervisorDetails,
          adminDetails: response.data.data.adminDetails,
        };
      } else {
        throw new Error("User not found.");
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      throw error;
    }
  },
};
