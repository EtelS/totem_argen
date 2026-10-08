import { useNavigate } from 'react-router-dom';
import { ApiError } from '../api/client';
import { insertarLlamado } from '../api/atencion';
import { useAuthStore } from '../store/useAuthStore';

/**
 * Registra en la cola de Recepcion a quien pasa por el totem y devuelve el
 * numero de llamado que genera el backend. `pacienteCodigo` es null cuando
 * el DNI no existe. Si el backend falla devuelve null y lleva a `/error`,
 * asi el paciente no ve un numero que no quedo registrado.
 */
export function useRegistrarLlamado() {
  const navigate = useNavigate();
  const sucursal = useAuthStore((s) => s.sucursal);

  return async (dni: string, pacienteCodigo: number | null): Promise<number | null> => {
    if (!sucursal) {
      return null;
    }

    try {
      return await insertarLlamado(sucursal.suc_id, dni, pacienteCodigo);
    } catch (e) {
      // A 401 already closed the session; RequireSesion sends the totem back to login.
      if (!(e instanceof ApiError && e.status === 401)) {
        navigate('/error');
      }
      return null;
    }
  };
}
