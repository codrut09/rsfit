import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In React Native, this would load from AsyncStorage / SecureStore
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const response = await axios.post('http://localhost:8080/api/auth/login', { email, password });
    const { token: userToken, role: userRole } = response.data;
    setToken(userToken);
    setRole(userRole);
    axios.defaults.headers.common['Authorization'] = `Bearer ${userToken}`;
  };

  const logout = async () => {
    setToken(null);
    setRole(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ token, role, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
