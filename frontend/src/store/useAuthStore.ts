import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Sucursal, TotemRecepcion } from '../api/types';

interface AuthState {
  usuario: string | null;
  token: string | null;
  sucursal: Sucursal | null;
  sucursalesDisponibles: Sucursal[] | null;
  totemRecepcion: TotemRecepcion | null;
  setCredencialesValidadas: (usuario: string, token: string, sucursales: Sucursal[]) => void;
  setSucursal: (sucursal: Sucursal) => void;
  setTotemRecepcion: (totemRecepcion: TotemRecepcion) => void;
  setToken: (token: string) => void;
  cerrarSesion: () => void;
}

/**
 * Sesion del totem (usuario + token + sucursal + totem de recepcion). Se persiste
 * en localStorage para que, una vez configurado, el totem no vuelva a pedir
 * login al recargar. El totem de recepcion pertenece a la sucursal, por eso se
 * descarta cada vez que la sucursal cambia.
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      usuario: null,
      token: null,
      sucursal: null,
      sucursalesDisponibles: null,
      totemRecepcion: null,
      setCredencialesValidadas: (usuario, token, sucursales) => {
        if (sucursales.length === 1) {
          set({ usuario, token, sucursal: sucursales[0], sucursalesDisponibles: null, totemRecepcion: null });
        } else {
          set({ usuario, token, sucursal: null, sucursalesDisponibles: sucursales, totemRecepcion: null });
        }
      },
      setSucursal: (sucursal) => set({ sucursal, sucursalesDisponibles: null, totemRecepcion: null }),
      setTotemRecepcion: (totemRecepcion) => set({ totemRecepcion }),
      setToken: (token) => set({ token }),
      cerrarSesion: () =>
        set({ usuario: null, token: null, sucursal: null, sucursalesDisponibles: null, totemRecepcion: null }),
    }),
    {
      name: 'totem-sesion',
      partialize: (state) => ({
        usuario: state.usuario,
        token: state.token,
        sucursal: state.sucursal,
        totemRecepcion: state.totemRecepcion,
      }),
    },
  ),
);
