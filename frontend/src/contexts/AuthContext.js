import React, { createContext, useContext, useState, useEffect } from 'react';
import { WS_BASE_URL, API_BASE_URL } from '../config/wsConfig';
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const isAuthenticated = !!user;

  const getCurrentUser = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/user_info/`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data);
      } else {
        logout(); // token 失效
      }
    } catch {
      logout();
    }
  };

  const login = (accessToken, refreshToken, username) => {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
    setUser({ username });
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
  };

  useEffect(() => {
    getCurrentUser(); // 初始化加载登录态
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
