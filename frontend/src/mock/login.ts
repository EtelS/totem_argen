import { Sucursal, USUARIOS_MOCK } from './authData';

export type ResultadoLogin =
  | { ok: true; usuario: string; sucursales: Sucursal[] }
  | { ok: false };

/**
 * Validacion de credenciales. Async a proposito: representa el punto donde
 * mas adelante se reemplaza por una llamada HTTP real al backend.
 */
export async function login(usuario: string, contrasena: string): Promise<ResultadoLogin> {
  const encontrado = USUARIOS_MOCK.find(
    (u) => u.usuario === usuario && u.contrasena === contrasena,
  );

  if (!encontrado) {
    return { ok: false };
  }

  return { ok: true, usuario: encontrado.usuario, sucursales: encontrado.sucursales };
}
