import { createContext, useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (storedUser && token) {
      setUser(JSON.parse(storedUser));

      // Check token expiration
      const tokenExpiration = decodeTokenExpiration(token);
      if (tokenExpiration) {
        const currentTime = Date.now() / 1000; // Convert to seconds

        if (tokenExpiration - currentTime <= 300) {
          // 5 min left
          toast.warning("⚠️ Your session is about to expire! Please re-login soon.");
        }

        const timeout = setTimeout(() => {
          toast.error("❌ Session expired! Please login again.");
          logout();
        }, (tokenExpiration - currentTime) * 1000);

        return () => clearTimeout(timeout);
      }
    }
  }, []);

  const decodeTokenExpiration = (token) => {
    try {
      const payload = JSON.parse(atob(token.split(".")[1])); // Decode JWT payload
      return payload.exp; // Expiration time in seconds
    } catch (error) {
      console.error("Error decoding token:", error);
      return null;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ user, logout }}>
      <>
        <ToastContainer />
        {children}
      </>
    </AuthContext.Provider>
  );
};

export default AuthProvider;
