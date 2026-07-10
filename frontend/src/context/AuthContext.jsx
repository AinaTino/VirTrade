import { createContext, useContext, useMemo, useState, useCallback, useEffect } from 'react';
import { login as apiLogin, register as apiRegister } from '../api/auth.js';
import { setupMocks } from '../mocks/browser.js';
import { setAuthToken } from '../api/axiosClient.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('virtrade-token'));
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('virtrade-user') || 'null'));

  useEffect(() => {
    if (token) {
      localStorage.setItem('virtrade-token', token);
    } else {
      localStorage.removeItem('virtrade-token');
    }
    // keep axios client in sync with stored token
    setAuthToken(token);
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('virtrade-user', JSON.stringify(user));
    } else {
      localStorage.removeItem('virtrade-user');
    }
  }, [user]);

  const login = async (credentials) => {
    const response = await apiLogin(credentials);
    setToken(response.token);
    setUser(response.user);
    return response;
  };

  const register = async (credentials) => {
    const response = await apiRegister(credentials);
    setToken(response.token);
    setUser(response.user);
    return response;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  const initializeMocks = useCallback(() => {
    setupMocks();
  }, []);

  const value = useMemo(() => ({ token, user, login, register, logout, initializeMocks }), [token, user, initializeMocks]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
