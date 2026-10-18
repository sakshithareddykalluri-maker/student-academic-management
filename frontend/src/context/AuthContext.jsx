
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
} from 'react';

import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Extract the actual user object from the backend response
  const getUserData = (response) => {
    const userData =
      response?.user ??
      response?.data?.user ??
      response?.data ??
      response;

    if (!userData || typeof userData !== 'object') {
      throw new Error('User information was not returned by the server.');
    }

    if (!userData.role) {
      console.error('User response does not contain a role:', response);
      throw new Error('Login response is missing the user role.');
    }

    return userData;
  };

  // Check whether a user is already logged in
  const checkAuth = async () => {
    try {
      const response = await authService.getCurrentUser();
      const userData = getUserData(response);

      setUser(userData);
      return userData;
    } catch (err) {
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  // Login
  const login = async (email, password) => {
    const response = await authService.login(email, password);

    console.log('BACKEND LOGIN RESPONSE:', response);

    const userData = getUserData(response);

    console.log('AUTH CONTEXT USER:', userData);
    console.log('AUTH CONTEXT ROLE:', userData.role);

    setUser(userData);

    return userData;
  };

  // Logout
  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        refreshUser: checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
