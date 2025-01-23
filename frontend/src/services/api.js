
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

const authHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const handleError = (error) => {
  console.error("API Error:", error.message);
  if (error.message.includes("NetworkError")) {
    return "Network error occurred. Please check your connection.";
  }
  return error.message || "An unexpected error occurred.";
};

const serializeParams = (params) => {
  return Object.keys(params)
    .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join("&");
};

export const api = {
  post: async (endpoint, data) => {
    try {
      console.log(`POST Request to: ${BASE_URL}${endpoint}`, data);
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders(),
        },
        body: JSON.stringify(data),
      });
      console.log(`Response from: ${BASE_URL}${endpoint}`, response);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "API POST request failed");
      }
      return await response.json();
    } catch (error) {
      throw new Error(handleError(error));
    }
  },

  get: async (endpoint, params = {}) => {
    try {
      const queryString = serializeParams(params);
      const url = queryString ? `${BASE_URL}${endpoint}?${queryString}` : `${BASE_URL}${endpoint}`;
      console.log(`GET Request to: ${url}`);
      const response = await fetch(url, {
        headers: {
          ...authHeaders(),
        },
      });
      console.log(`Response from: ${url}`, response);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "API GET request failed");
      }
      return await response.json();
    } catch (error) {
      throw new Error(handleError(error));
    }
  },

  put: async (endpoint, data) => {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders(),
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "API PUT request failed");
      }
      return await response.json();
    } catch (error) {
      throw new Error(handleError(error));
    }
  },

  delete: async (endpoint) => {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: "DELETE",
        headers: {
          ...authHeaders(),
        },
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "API DELETE request failed");
      }
      return await response.json();
    } catch (error) {
      throw new Error(handleError(error));
    }
  },
};
