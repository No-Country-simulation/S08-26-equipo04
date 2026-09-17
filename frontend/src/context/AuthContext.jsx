import { createContext, useContext, useMemo, useState } from 'react';
import { apiPost } from '../api';
import { mocks } from '../mocks';
import { clearSession, readSession, saveSession } from '../api/session';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(readSession);

  const login = async ({ email, password }) => {
    try {
      const { data } = await apiPost('/api/auth/login', { email, password });
      // El backend devuelve { token, rol, nombre }. El id se puentea con
      // el mock por email para que los filtros por vendedor_id sigan
      // funcionando hasta migrar cada provider (quitar al integrar).
      const mockMatch = mocks.auth.find((a) => a.email === email);
      const session = {
        id: mockMatch?.id ?? null,
        nombre: data.nombre,
        email,
        rol: data.rol,
        token: data.token,
      };
      saveSession(session);
      setUser(session);
      return session;
    } catch (error) {
      const message =
        error?.response?.data?.error ||
        (error?.code === 'ECONNABORTED'
          ? 'El servidor tarda en responder (Render en frio). Reintenta.'
          : 'No se pudo iniciar sesion. Revisa tu conexion.');
      throw new Error(message, { cause: error });
    }
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