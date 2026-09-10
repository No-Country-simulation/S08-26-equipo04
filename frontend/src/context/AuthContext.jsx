import { createContext, useContext, useMemo, useState } from 'react';
import { mocks } from '../mocks';

const AuthContext = createContext(null);
const STORAGE_KEY = 'qualitytrack-auth';

const readSession = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || null;
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(readSession);

  const login = () => {
    const session = mocks.auth;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    setUser(session);
    return session;
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  };

  const value = useMemo(() => ({ user, isAuthenticated: Boolean(user), login, logout }), [user]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return context;
};