export interface Sucursal {
  suc_id: number;
  suc_nom: string;
}

export interface Paciente {
  dni: string;
  nombreYApellido: string;
  mutual: string;
  /** Token the mutual requires at check-in. The backend does not provide it yet. */
  token?: string;
}

export interface Turno {
  codigo: number;
  fecha: string;
  hora: string;
  prestador: string;
  mutual: string;
  /** Particular turnos are not confirmed at the totem; choosing one sends the patient to Recepcion. */
  particular: boolean;
}
