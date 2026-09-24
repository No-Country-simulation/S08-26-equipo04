import api from './client';

export { api };
export * from './helpers';
export * from './session';

export const apiGet = (url, config = {}) => api.get(url, config);
export const apiPost = (url, data, config = {}) => api.post(url, data, config);
export const apiPut = (url, data, config = {}) => api.put(url, data, config);
export const apiPatch = (url, data, config = {}) => api.patch(url, data, config);
export const apiDelete = (url, config = {}) => api.delete(url, config);
