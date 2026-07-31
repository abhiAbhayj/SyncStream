import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
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
    const MAX_RETRIES = 4;
    const RETRY_DELAY = 4000;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        const res = await axios.post('/api/auth/login', { phone_number, password });
        const { token: userToken, user: userData } = res.data;
        localStorage.setItem('token', userToken);
        setToken(userToken);
        setUser(userData);
        return { success: true };
      } catch (err) {
        const status = err.response?.status;
        // On 500 (server cold-start / DB not ready), retry silently
        if (status === 500 && attempt < MAX_RETRIES) {
          await new Promise(r => setTimeout(r, RETRY_DELAY));
          continue;
        }
        return {
          success: false,
          error: status === 500
            ? 'Server is still starting up. Please wait 30 seconds and try again.'
            : (err.response?.data?.error || 'Login failed. Please check your credentials.')
        };
      }
    }
  };

  const register = async (username, phone_number, password) => {
    const MAX_RETRIES = 4;
    const RETRY_DELAY = 4000;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        const res = await axios.post('/api/auth/register', { username, phone_number, password });
        const { token: userToken, user: userData } = res.data;
        localStorage.setItem('token', userToken);
        setToken(userToken);
        setUser(userData);
        return { success: true };
      } catch (err) {
        const status = err.response?.status;
        if (status === 500 && attempt < MAX_RETRIES) {
          await new Promise(r => setTimeout(r, RETRY_DELAY));
          continue;
        }
        return {
          success: false,
          error: status === 500
            ? 'Server is still starting up. Please wait 30 seconds and try again.'
            : (err.response?.data?.error || 'Registration failed. Try a different username/phone number.')
        };
      }
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
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
