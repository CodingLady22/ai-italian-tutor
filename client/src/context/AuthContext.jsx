import { createContext, useState, useContext } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user_data");

    if (token) {
      return storedUser ? { token, ...JSON.parse(storedUser) } : { token };
    }
    return null;
  });

  const login = async (email, password) => {
    try {
      const response = await api.post("/auth/login", { email, password });
      const { access_token, user: userData } = response.data;

      localStorage.setItem("token", access_token);
      localStorage.setItem("user_data", JSON.stringify(userData));

      setUser({ token: access_token, ...userData });
      return { success: true };
    } catch (error) {
      console.error("Login failed:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Login failed",
      };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user_data");
    setUser(null);
  };

  const register = async (name, email, password, level) => {
    try {
      const response = await api.post("/auth/signup", {
        name,
        email,
        password,
        italian_level: level,
      });
      const { access_token, user: userData } = response.data;

      if (access_token) {
        localStorage.setItem("token", access_token);
        localStorage.setItem("user_data", JSON.stringify(userData));
        setUser({ token: access_token, ...userData });
        return { success: true };
      }
      return {
        success: false,
        message: "Registration failed: No token received",
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.date?.message || "Registration failed",
      };
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
