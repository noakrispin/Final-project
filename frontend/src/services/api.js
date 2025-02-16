/**
 * API Service
 *
 * This module provides a set of functions to interact with the backend API.
 * It includes methods for making GET, POST, PUT, and DELETE requests.
 * The base URL for the API is determined by the environment variable `VITE_API_BASE_URL`.
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001/api";

/**
 * Generates authorization headers for API requests.
 *
 * @returns {Object} Headers object containing the Authorization token if available.
 */
const authHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * Handles API errors by logging them and returning a user-friendly message.
 *
 * @param {Error} error - The error object thrown by the fetch API.
 * @returns {string} A user-friendly error message.
 */
const handleError = (error) => {
  console.error("API Error:", error.message);
  if (error.message.includes("NetworkError")) {
    return "Network error occurred. Please check your connection.";
  }
  return error.message || "An unexpected error occurred.";
};

/**
 * Serializes an object into a query string.
 *
 * @param {Object} params - The parameters to serialize.
 * @returns {string} The serialized query string.
 */
const serializeParams = (params) => {
  return Object.keys(params)
    .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join("&");
};

export const api = {
  /**
   * Makes a POST request to the specified endpoint with the given data.
   *
   * @param {string} endpoint - The API endpoint to send the request to.
   * @param {Object} data - The data to send in the request body.
   * @returns {Promise<Object>} The response data from the API.
   * @throws {Error} If the request fails.
   */
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

  /**
   * Makes a GET request to the specified endpoint with the given parameters.
   *
   * @param {string} endpoint - The API endpoint to send the request to.
   * @param {Object} [params={}] - The query parameters to include in the request.
   * @returns {Promise<Object>} The response data from the API.
   * @throws {Error} If the request fails.
   */
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

  /**
   * Makes a PUT request to the specified endpoint with the given data.
   *
   * @param {string} endpoint - The API endpoint to send the request to.
   * @param {Object} data - The data to send in the request body.
   * @returns {Promise<Object>} The response data from the API.
   * @throws {Error} If the request fails.
   */
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

  /**
   * Makes a DELETE request to the specified endpoint.
   *
   * @param {string} endpoint - The API endpoint to send the request to.
   * @returns {Promise<Object>} The response data from the API.
   * @throws {Error} If the request fails.
   */
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
