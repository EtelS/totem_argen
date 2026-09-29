import { create } from 'zustand';
import { Paciente, Turno } from '../api/types';

export type ConfirmacionData =
  | { tipo: 'turno'; paciente: Paciente; turno: Turno }
  | { tipo: 'derivado'; numero: number; paciente?: Paciente };

export interface PendienteToken {
  paciente: Paciente;
  turno: Turno;
}

export interface SeleccionTurno {
  paciente: Paciente;
  turnos: Turno[];
}

interface TotemState {
  dni: string | null;
  seleccionTurno: SeleccionTurno | null;
  pendienteToken: PendienteToken | null;
  confirmacion: ConfirmacionData | null;
  contador: number;
  setDni: (dni: string) => void;
  setSeleccionTurno: (data: SeleccionTurno | null) => void;
  setPendienteToken: (data: PendienteToken | null) => void;
  setConfirmacion: (data: ConfirmacionData) => void;
  siguienteNumero: () => number;
  reset: () => void;
}

export const useTotemStore = create<TotemState>((set, get) => ({
  dni: null,
  seleccionTurno: null,
  pendienteToken: null,
  confirmacion: null,
  contador: 0,
  setDni: (dni) => set({ dni }),
  setSeleccionTurno: (seleccionTurno) => set({ seleccionTurno }),
  setPendienteToken: (pendienteToken) => set({ pendienteToken }),
  setConfirmacion: (confirmacion) => set({ confirmacion }),
  siguienteNumero: () => {
    const siguiente = get().contador + 1;
    set({ contador: siguiente });
    return siguiente;
  },
  reset: () => set({ dni: null, seleccionTurno: null, pendienteToken: null, confirmacion: null }),
}));
