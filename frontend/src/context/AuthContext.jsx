import React, { createContext, useContext, useState, useEffect } from "react";
import {api} from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser && storedUser !== "undefined") { // Check for valid stored value
        const parsedUser = JSON.parse(storedUser);
        console.log("User found in localStorage:", parsedUser);
        setUser(parsedUser);
      } else {
        console.log("No valid user found in localStorage, clearing...");
        localStorage.removeItem("user"); // Clean up invalid data
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage:", error);
      localStorage.removeItem("user"); // Clean up invalid data if parsing fails
    }
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post("/auth/login", { email, password });
      const { user, token } = response;
      console.log("Login API response:", response);

      // Save user and token in localStorage
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", token);

      // Update user in context
      setUser(user);
      console.log("Login successful. User set in context:", user);
      return { success: true };
    } catch (error) {
      console.error("Error logging in:", error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
