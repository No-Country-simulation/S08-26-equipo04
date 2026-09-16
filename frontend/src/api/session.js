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
