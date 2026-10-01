export const STORAGE_KEY = 'qualitytrack-auth';

export const readSession = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || null;
  } catch {
    return null;
  }
};

export const saveSession = (session) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
};

export const clearSession = () => {
  localStorage.removeItem(STORAGE_KEY);
};

// El JWT trae `exp` (segundos). Si ya venció, la sesión no se restaura y el
// ProtectedRoute manda a /login en vez de abrir la última pestaña con un
// token muerto (que después falla en cada provider con 401/403).
// Si el token no se puede leer, se conserva: el backend responde 401 y el
// interceptor limpia y redirige igual.
export const tokenExpirado = (token) => {
  try {
    if (!token || typeof token !== "string") return false;
    const payload = JSON.parse(atob(token.split(".")[1]));
    if (typeof payload.exp !== "number") return false;
    return payload.exp * 1000 <= Date.now();
  } catch {
    return false;
  }
};
