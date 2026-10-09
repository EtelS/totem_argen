import { create } from 'zustand';
import { Paciente, Turno } from '../api/types';

export type ConfirmacionData =
  | { tipo: 'turno'; numero: number; paciente: Paciente; turno: Turno }
  | { tipo: 'derivado'; numero: number; paciente?: Paciente; turno?: Turno };

export interface PendienteToken {
  paciente: Paciente;
  turno: Turno;
  /** Llamado number already registered when the turno was chosen. */
  numero: number;
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
  setDni: (dni: string) => void;
  setSeleccionTurno: (data: SeleccionTurno | null) => void;
  setPendienteToken: (data: PendienteToken | null) => void;
  setConfirmacion: (data: ConfirmacionData) => void;
  reset: () => void;
}

export const useTotemStore = create<TotemState>((set) => ({
  dni: null,
  seleccionTurno: null,
  pendienteToken: null,
  confirmacion: null,
  setDni: (dni) => set({ dni }),
  setSeleccionTurno: (seleccionTurno) => set({ seleccionTurno }),
  setPendienteToken: (pendienteToken) => set({ pendienteToken }),
  setConfirmacion: (confirmacion) => set({ confirmacion }),
  reset: () => set({ dni: null, seleccionTurno: null, pendienteToken: null, confirmacion: null }),
}));
