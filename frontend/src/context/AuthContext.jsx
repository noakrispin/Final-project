import React, { createContext, useContext, useState, useEffect } from "react";
import { api } from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Add loading state

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser && storedUser !== "undefined") {
        const parsedUser = JSON.parse(storedUser);
        console.log("User found in localStorage:", parsedUser);

        // Ensure isAdmin is boolean
        const processedUser = {
          ...parsedUser,
          isAdmin: !!parsedUser.isAdmin,
        };
        setUser(processedUser);
      } else {
        console.log("No valid user found in localStorage, clearing...");
        localStorage.removeItem("user");
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage:", error);
      localStorage.removeItem("user");
    } finally {
      setLoading(false); // Set loading to false after restoration
    }
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post("/auth/login", { email, password });
      console.log("Login API response:", response);

      const { user, token } = response;

      // Ensure isAdmin is boolean
      const processedUser = {
        ...user,
        isAdmin: !!user.isAdmin,
      };

      // Save user and token in localStorage
      localStorage.setItem("user", JSON.stringify(processedUser));
      localStorage.setItem("token", token);

      setUser(processedUser);
      return { success: true, user: processedUser };
    } catch (error) {
      console.error("Login error:", error.message);
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
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
