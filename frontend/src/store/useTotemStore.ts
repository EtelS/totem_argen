import { create } from 'zustand';
import { Paciente, Turno } from '../mock/data';

export type ConfirmacionData =
  | { tipo: 'turno'; paciente: Paciente; turno: Turno }
  | { tipo: 'derivado'; numero: number; paciente?: Paciente };

export interface PendienteToken {
  paciente: Paciente;
  turno: Turno;
}

interface TotemState {
  dni: string | null;
  pendienteToken: PendienteToken | null;
  confirmacion: ConfirmacionData | null;
  contador: number;
  setDni: (dni: string) => void;
  setPendienteToken: (data: PendienteToken | null) => void;
  setConfirmacion: (data: ConfirmacionData) => void;
  siguienteNumero: () => number;
  reset: () => void;
}

export const useTotemStore = create<TotemState>((set, get) => ({
  dni: null,
  pendienteToken: null,
  confirmacion: null,
  contador: 0,
  setDni: (dni) => set({ dni }),
  setPendienteToken: (pendienteToken) => set({ pendienteToken }),
  setConfirmacion: (confirmacion) => set({ confirmacion }),
  siguienteNumero: () => {
    const siguiente = get().contador + 1;
    set({ contador: siguiente });
    return siguiente;
  },
  reset: () => set({ dni: null, pendienteToken: null, confirmacion: null }),
}));
