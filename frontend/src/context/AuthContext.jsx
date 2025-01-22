import React, { createContext, useContext, useState, useEffect } from "react";
import { api } from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedUser = localStorage.getItem("user");
        const token = localStorage.getItem("token");

        if (storedUser && token) {
          const parsedUser = JSON.parse(storedUser);
          console.log("Restoring user session:", parsedUser);

          // Optimistically set the user
          setUser(parsedUser);

          // Validate the token with the backend
          const response = await api.get("/auth/validate", {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (response.status === 200) {
            console.log("Token validation successful");
          } else {
            throw new Error("Token validation failed");
          }
        } else {
          console.log("No valid user or token found in localStorage");
        }
      } catch (error) {
        console.error("Session restoration error:", error.message);

        // Keep the user logged in if it's a network issue
        if (!error.response || error.response.status >= 500) {
          console.warn("Skipping logout due to backend issue");
        } else {
          // Logout only on authentication-related issues
          localStorage.removeItem("user");
          localStorage.removeItem("token");
          setUser(null);
        }
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post("/auth/login", { email, password });
      console.log("Login successful:", response);

      const { user, token } = response;

      const processedUser = {
        ...user,
        isAdmin: !!user.isAdmin, // Ensure isAdmin is boolean
      };

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
