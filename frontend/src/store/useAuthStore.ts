import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Sucursal } from '../mock/authData';

interface AuthState {
  usuario: string | null;
  sucursal: Sucursal | null;
  sucursalesDisponibles: Sucursal[] | null;
  setCredencialesValidadas: (usuario: string, sucursales: Sucursal[]) => void;
  setSucursal: (sucursal: Sucursal) => void;
}

/**
 * Sesion del totem (usuario + sucursal). Se persiste en localStorage para
 * que, una vez configurado, el totem no vuelva a pedir login al recargar.
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      usuario: null,
      sucursal: null,
      sucursalesDisponibles: null,
      setCredencialesValidadas: (usuario, sucursales) => {
        if (sucursales.length === 1) {
          set({ usuario, sucursal: sucursales[0], sucursalesDisponibles: null });
        } else {
          set({ usuario, sucursal: null, sucursalesDisponibles: sucursales });
        }
      },
      setSucursal: (sucursal) => set({ sucursal, sucursalesDisponibles: null }),
    }),
    {
      name: 'totem-sesion',
      partialize: (state) => ({ usuario: state.usuario, sucursal: state.sucursal }),
    },
  ),
);
