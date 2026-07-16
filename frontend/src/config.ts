// Global API configuration points supporting local simulation and multi-platform cloud deployments
const sanitizeUrl = (url: string) => url.replace(/\/+$/, '');

export const API_URL = sanitizeUrl(import.meta.env.VITE_API_URL || 'http://localhost:3001');
export const SOCKET_URL = sanitizeUrl(import.meta.env.VITE_SOCKET_URL || API_URL);
