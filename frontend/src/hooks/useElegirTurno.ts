import { useNavigate } from 'react-router-dom';
import { Paciente, Turno } from '../api/types';
import { useTotemStore } from '../store/useTotemStore';
import { useConfirmarTurno } from './useConfirmarTurno';
import { useRegistrarLlamado } from './useRegistrarLlamado';

/**
 * Resuelve el turno que eligio el paciente. Primero registra el llamado en
 * Recepcion (el backend genera el numero). Despues: si su mutual no tiene
 * autogestion en la sucursal se deriva a Recepcion con ese numero (sin
 * cambiar el estado del turno); si la mutual pide codigo de seguridad se
 * pasa a `/token`; si no, se confirma el turno en el backend.
 *
 * No limpia `seleccionTurno`: lo hace `Confirmacion` al montarse. Limpiarlo
 * aca, despues del `await`, re-renderiza `SeleccionarTurno` antes de que
 * cambie la ruta y su redireccion a '/' pisa la navegacion.
 */
export function useElegirTurno() {
  const navigate = useNavigate();
  const setPendienteToken = useTotemStore((s) => s.setPendienteToken);
  const setConfirmacion = useTotemStore((s) => s.setConfirmacion);
  const confirmar = useConfirmarTurno();
  const registrarLlamado = useRegistrarLlamado();

  return async (paciente: Paciente, turno: Turno) => {
    const numero = await registrarLlamado(paciente.dni, paciente.codigo);
    if (numero === null) {
      return;
    }

    if (!turno.autogestion) {
      setConfirmacion({ tipo: 'derivado', numero, paciente, turno });
      navigate('/confirmacion');
      return;
    }

    if (turno.pideCodigoSeguridad) {
      setPendienteToken({ paciente, turno, numero });
      navigate('/token');
      return;
    }

    await confirmar(paciente, turno, numero);
  };
}
