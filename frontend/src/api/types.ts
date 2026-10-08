export interface Sucursal {
  suc_id: number;
  suc_nom: string;
}

export interface Paciente {
  /** BDTurnero..Paciente.Codigo, used to register the llamado in Recepcion. */
  codigo: number;
  dni: string;
  nombreYApellido: string;
  mutual: string;
}

export interface Turno {
  codigo: number;
  fecha: string;
  hora: string;
  prestador: string;
  mutual: string;
  /** Only autogestion turnos are confirmed at the totem; choosing any other sends the patient to Recepcion. */
  autogestion: boolean;
  /** The patient must enter the mutual's security token before confirming. */
  pideCodigoSeguridad: boolean;
}
