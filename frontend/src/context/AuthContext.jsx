import React, { createContext, useContext, useState, useEffect } from "react";
import { api } from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser && storedUser !== "undefined") {
        const parsedUser = JSON.parse(storedUser);
        console.log("User found in localStorage:", parsedUser);
        setUser(parsedUser);
      } else {
        console.log("No valid user found in localStorage, clearing...");
        localStorage.removeItem("user");
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage:", error);
      localStorage.removeItem("user");
    }
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post("/auth/login", { email, password });
      console.log("Login API response:", response); // Debugging log

      const { user, token } = response;

      // Save user and token in localStorage
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", token);

      // Update user in context
      setUser(user);

      // Return success with user data
      return { success: true, user };
    } catch (error) {
      console.error("Login error:", error.message); // Debugging log
      return {
        success: false,
        message: error.response?.data?.message || "An error occurred. Please try again.",
      };
    }
  };

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    console.log("User logged out.");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
