import { useAuthStore } from '../store/useAuthStore';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/+$/, '');

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface ApiRequest {
  method?: 'GET' | 'POST';
  body?: unknown;
  autenticado?: boolean;
}

export async function apiFetch<T>(path: string, { method = 'GET', body, autenticado = true }: ApiRequest = {}): Promise<T> {
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  if (autenticado) {
    const token = useAuthStore.getState().token;
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  const respuesta = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!respuesta.ok) {
    // An expired or revoked token cannot be recovered on the kiosk: force a new login.
    if (autenticado && respuesta.status === 401) {
      useAuthStore.getState().cerrarSesion();
    }
    throw new ApiError(respuesta.status, await leerMensajeError(respuesta));
  }

  return (await respuesta.json()) as T;
}

async function leerMensajeError(respuesta: Response): Promise<string> {
  try {
    const data = await respuesta.json();
    return data?.mensaje ?? data?.Message ?? respuesta.statusText;
  } catch {
    return respuesta.statusText;
  }
}
