import { useNavigate } from 'react-router-dom';
import { ApiError } from '../api/client';
import { confirmarTurno } from '../api/atencion';
import { Paciente, Turno } from '../api/types';
import { useAuthStore } from '../store/useAuthStore';
import { useTotemStore } from '../store/useTotemStore';

/**
 * Registra en el backend la confirmacion del turno (Estado = 2) y recien
 * entonces muestra "Turno confirmado" con el numero de llamado. Si el backend falla, el paciente no
 * ve una confirmacion que no quedo registrada.
 */
export function useConfirmarTurno() {
  const navigate = useNavigate();
  const sucursal = useAuthStore((s) => s.sucursal);
  const setConfirmacion = useTotemStore((s) => s.setConfirmacion);

  return async (paciente: Paciente, turno: Turno, numero: number) => {
    if (!sucursal) {
      return;
    }

    try {
      await confirmarTurno(sucursal.suc_id, paciente.dni, turno.codigo);
    } catch (e) {
      // A 401 already closed the session; RequireSesion sends the totem back to login.
      if (!(e instanceof ApiError && e.status === 401)) {
        navigate('/error');
      }
      return;
    }

    setConfirmacion({ tipo: 'turno', numero, paciente, turno });
    navigate('/confirmacion');
  };
}
