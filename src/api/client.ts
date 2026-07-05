import axios from 'axios';

// URL del backend Spring Boot. Cambia aquí si lo levantas en otro puerto/host.
export const API_BASE_URL = 'http://localhost:8080';

export const TOKEN_KEY = 'token';

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Request: adjunta el Bearer token en cada petición si existe.
client.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response: si el backend responde 401, limpiamos la sesión y volvemos al login.
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

/**
 * Normaliza los errores del backend a un string legible.
 * - Errores de negocio:  { "error": "mensaje" }
 * - Errores de validación: { "campo": "mensaje", ... }
 */
export function extractError(err: unknown, fallback = 'Ocurrió un error inesperado'): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as Record<string, unknown> | undefined;
    if (data) {
      if (typeof data.error === 'string') return data.error;
      const firstValue = Object.values(data)[0];
      if (typeof firstValue === 'string') return firstValue;
    }
    if (err.code === 'ERR_NETWORK') {
      return 'No se pudo conectar con el servidor. ¿Está corriendo en localhost:8080?';
    }
    return err.message || fallback;
  }
  return fallback;
}

export default client;
