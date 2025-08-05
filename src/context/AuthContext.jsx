import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('access_token');
    const savedUser = localStorage.getItem('user');

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await authAPI.login({ email, password });
      
      if (response.data && response.data.data) {
        const { access_token, user: userData } = response.data.data;
        

        localStorage.setItem('access_token', access_token);
        localStorage.setItem('user', JSON.stringify(userData));
        
   
        setToken(access_token);
        setUser(userData);
        
        return { success: true };
      }
      
      return { success: false, error: 'Invalid response format' };
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.message || 'Login failed. Please try again.';
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const refreshToken = async () => {
    try {
      const response = await authAPI.refreshToken();
      if (response.data && response.data.data) {
        const { access_token } = response.data.data;
        localStorage.setItem('access_token', access_token);
        setToken(access_token);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Token refresh error:', error);
      logout();
      return false;
    }
  };

  const getProfile = async () => {
    try {
      const response = await authAPI.getProfile();
      if (response.data && response.data.data) {
        const userData = response.data.data;
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        return userData;
      }
      return null;
    } catch (error) {
      console.error('Get profile error:', error);
      return null;
    }
  };

  const isAuthenticated = () => {
    return token && user;
  };

  const hasRole = (role) => {
    return user && user.role === role;
  };

  const canManageProducts = () => {
    if (!user) return false;
    
    const role = user.role;
    const isAdmin = role === 'super_admin' || 
                   role === 'admin' || 
                   role === 'superadmin' ||
                   role === 'Super Admin' ||
                   role === 'Admin' ||
                   role === 'SUPER_ADMIN' ||
                   role === 'ADMIN';
    
    return isAdmin;
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    refreshToken,
    getProfile,
    isAuthenticated,
    hasRole,
    canManageProducts
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
