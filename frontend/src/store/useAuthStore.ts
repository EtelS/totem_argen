import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Sucursal } from '../api/types';

interface AuthState {
  usuario: string | null;
  token: string | null;
  sucursal: Sucursal | null;
  sucursalesDisponibles: Sucursal[] | null;
  setCredencialesValidadas: (usuario: string, token: string, sucursales: Sucursal[]) => void;
  setSucursal: (sucursal: Sucursal) => void;
  setToken: (token: string) => void;
  cerrarSesion: () => void;
}

/**
 * Sesion del totem (usuario + token + sucursal). Se persiste en localStorage
 * para que, una vez configurado, el totem no vuelva a pedir login al recargar.
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      usuario: null,
      token: null,
      sucursal: null,
      sucursalesDisponibles: null,
      setCredencialesValidadas: (usuario, token, sucursales) => {
        if (sucursales.length === 1) {
          set({ usuario, token, sucursal: sucursales[0], sucursalesDisponibles: null });
        } else {
          set({ usuario, token, sucursal: null, sucursalesDisponibles: sucursales });
        }
      },
      setSucursal: (sucursal) => set({ sucursal, sucursalesDisponibles: null }),
      setToken: (token) => set({ token }),
      cerrarSesion: () => set({ usuario: null, token: null, sucursal: null, sucursalesDisponibles: null }),
    }),
    {
      name: 'totem-sesion',
      partialize: (state) => ({ usuario: state.usuario, token: state.token, sucursal: state.sucursal }),
    },
  ),
);
