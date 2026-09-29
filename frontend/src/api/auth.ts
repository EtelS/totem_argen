import { ApiError, apiFetch } from './client';
import { Sucursal } from './types';

interface LoginResponseDto {
  Token: string;
  Usuario: { NombreUsuario: string };
  Sucursales: { Codigo: number; Nombre: string }[];
}

export type ResultadoLogin =
  | { ok: true; usuario: string; token: string; sucursales: Sucursal[] }
  | { ok: false; mensaje: string };

export async function login(usuario: string, contrasena: string): Promise<ResultadoLogin> {
  try {
    const data = await apiFetch<LoginResponseDto>('/api/auth/login', {
      method: 'POST',
      body: { NombreUsuario: usuario, Contrasena: contrasena },
      autenticado: false,
    });
    console.log("data", data)

    return {
      ok: true,
      usuario: data.Usuario.NombreUsuario,
      token: data.Token,
      sucursales: data.Sucursales.map((s) => ({ suc_id: s.Codigo, suc_nom: s.Nombre })),
    };
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      return { ok: false, mensaje: 'Usuario o contrasena incorrectos' };
    }
    if (error instanceof ApiError && error.status === 403) {
      return { ok: false, mensaje: 'El usuario no tiene sucursales asociadas' };
    }
    throw error;
  }
}

export async function refrescarToken(): Promise<string> {
  const data = await apiFetch<{ Token: string }>('/api/auth/refresh', { method: 'POST', body: {} });
  return data.Token;
}
