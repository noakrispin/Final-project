const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

export const api = {
  post: async (endpoint, data) => {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "API POST request failed");
      }
      return await response.json();
    } catch (error) {
      console.error(`Error in POST ${endpoint}:`, error.message);
      throw error;
    }
  },

  get: async (endpoint) => {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "API GET request failed");
      }
      return await response.json();
    } catch (error) {
      console.error(`Error in GET ${endpoint}:`, error.message);
      throw error;
    }
  },
};
