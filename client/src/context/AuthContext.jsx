import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { syncLocalContinueWatchingToServer, fetchContinueWatching, clearContinueWatchingClientState } from '../utils/continueWatching';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem('token');
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  // Configure global axios default authorization header
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }

  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await axios.get('/api/auth/profile');
        setUser(res.data.user);
        // Load Continue Watching from MySQL
        fetchContinueWatching().catch(() => {});
      } catch (err) {
        console.error('Failed to fetch user profile:', err.message);
        logout();
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [token]);

  const login = async (phone_number, password) => {
    try {
      const res = await axios.post('/api/auth/login', { phone_number, password });
      const { token: userToken, user: userData } = res.data;
      localStorage.setItem('token', userToken);
      setToken(userToken);
      setUser(userData);
      // Sync guest continue watching items into user's MySQL account
      syncLocalContinueWatchingToServer().catch(() => {});
      return { success: true };
    } catch (err) {
      const status = err.response?.status;
      return {
        success: false,
        error: err.response?.data?.error || (status === 500 ? 'Server error. Database is offline or unreachable.' : 'Login failed. Please check your credentials.')
      };
    }
  };

  const register = async (username, phone_number, password) => {
    try {
      const res = await axios.post('/api/auth/register', { username, phone_number, password });
      const { token: userToken, user: userData } = res.data;
      localStorage.setItem('token', userToken);
      setToken(userToken);
      setUser(userData);
      // Sync guest continue watching items into user's MySQL account
      syncLocalContinueWatchingToServer().catch(() => {});
      return { success: true };
    } catch (err) {
      const status = err.response?.status;
      return {
        success: false,
        error: err.response?.data?.error || (status === 500 ? 'Server error. Database is offline or unreachable.' : 'Registration failed. Try a different username/phone number.')
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    clearContinueWatchingClientState();
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (username, avatarUrl) => {
    try {
      const res = await axios.put('/api/auth/profile', { username, avatar_url: avatarUrl });
      const { token: newToken, user: updatedUser } = res.data;
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(updatedUser);
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.error || 'Failed to update profile.'
      };
    }
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateProfile
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};
