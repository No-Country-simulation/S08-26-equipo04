import { createContext, useContext, useMemo, useState } from 'react';
import { mocks } from '../mocks';
import { clearSession, readSession, saveSession } from '../api/session';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(readSession);

  const login = (session = mocks.auth[0]) => {
    saveSession(session);
    setUser(session);
    return session;
  };

  const logout = () => {
    clearSession();
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