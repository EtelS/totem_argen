export interface Sucursal {
  suc_id: number;
  suc_nom: string;
}

export interface UsuarioCredenciales {
  usuario: string;
  contrasena: string;
  sucursales: Sucursal[];
}

/**
 * Un centro medico puede tener mas de una sucursal; el login resuelve a que
 * centro pertenece el usuario y con cuantas sucursales cuenta (ver mock/login.ts).
 */
export const USUARIOS_MOCK: UsuarioCredenciales[] = [
  {
    usuario: 'eteltotem',
    contrasena: 'eteltotem1234',
    sucursales: [{ suc_id: 16, suc_nom: 'clinicademo' }],
  },
];
