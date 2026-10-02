import { useNavigate } from 'react-router-dom';
import { Paciente, Turno } from '../api/types';
import { useTotemStore } from '../store/useTotemStore';
import { useConfirmarTurno } from './useConfirmarTurno';

/**
 * Resuelve el turno que eligio el paciente: si su mutual no tiene
 * autogestion en la sucursal se deriva a Recepcion con numero de orden (sin
 * cambiar su estado); si la mutual pide codigo de seguridad se pasa a
 * `/token`; si no, se confirma el turno en el backend.
 */
export function useElegirTurno() {
  const navigate = useNavigate();
  const setSeleccionTurno = useTotemStore((s) => s.setSeleccionTurno);
  const setPendienteToken = useTotemStore((s) => s.setPendienteToken);
  const setConfirmacion = useTotemStore((s) => s.setConfirmacion);
  const siguienteNumero = useTotemStore((s) => s.siguienteNumero);
  const confirmar = useConfirmarTurno();

  return async (paciente: Paciente, turno: Turno) => {
    if (!turno.autogestion) {
      setSeleccionTurno(null);
      setConfirmacion({ tipo: 'derivado', numero: siguienteNumero(), paciente });
      navigate('/confirmacion');
      return;
    }

    if (turno.pideCodigoSeguridad) {
      setSeleccionTurno(null);
      setPendienteToken({ paciente, turno });
      navigate('/token');
      return;
    }

    await confirmar(paciente, turno);
    setSeleccionTurno(null);
  };
}
