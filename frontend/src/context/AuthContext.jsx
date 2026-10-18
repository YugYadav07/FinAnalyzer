import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('auth_token'));
  const [loading, setLoading] = useState(true);

  // Set axios auth header whenever token changes
  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('auth_token', token);
    } else {
      delete api.defaults.headers.common['Authorization'];
      localStorage.removeItem('auth_token');
    }
  }, [token]);

  // On mount, verify the token by fetching /auth/me
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.get('/auth/me');
        setUser(res);
      } catch {
        // Token is invalid or expired
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    verifyToken();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    setToken(res.access_token);
    setUser(res.user);
    return res;
  };

  const register = async (email, full_name, password) => {
    const res = await api.post('/auth/register', { email, full_name, password });
    setToken(res.access_token);
    setUser(res.user);
    return res;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
