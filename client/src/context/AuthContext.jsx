import { createContext, useState, useContext } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

const readStoredUser = () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;

    const storedUser = localStorage.getItem("user_data");
    const userData = storedUser ? JSON.parse(storedUser) : null;
    const isObject = userData && typeof userData === "object";
    return isObject ? { token, ...userData } : { token };
  } catch {
    // Corrupt or blocked storage: drop the bad entry and start logged out.
    try {
      localStorage.removeItem("user_data");
    } catch {
      /* storage unavailable */
    }
    return readTokenOnly();
  }
};

const readTokenOnly = () => {
  try {
    const token = localStorage.getItem("token");
    return token ? { token } : null;
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(readStoredUser);
  // Storage is read synchronously above, so there is nothing to wait for.
  // Routes read `loading`; switch this to state if auth ever becomes async.
  const loading = false;

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

  const updateUser = (newUserData) => {
    const updatedUser = { ...user, ...newUserData };
    setUser(updatedUser);

    // token not stored in user_data in localStorage
    const { token: _, ...dataToStore } = updatedUser;
    localStorage.setItem("user_data", JSON.stringify(dataToStore));
  };

  const register = async (name, email, password, level, supportLanguage) => {
    try {
      const response = await api.post("/auth/signup", {
        name,
        email,
        password,
        italian_level: level,
        supportLanguage: supportLanguage,
      });

      return {
        success: true,
        message:
          response.data.message ||
          "Registration successful! You can now log in.",
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Registration failed",
      };
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
