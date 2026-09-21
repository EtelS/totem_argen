import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

/**
 * Pantalla de seleccion de sucursal (`/seleccionar-sucursal`). Solo se
 * muestra cuando el usuario logueado pertenece a un centro medico con mas
 * de una sucursal (ver Login.tsx); con una sola, se autoselecciona.
 */
export function SeleccionarSucursal() {
  const sucursalesDisponibles = useAuthStore((s) => s.sucursalesDisponibles);
  const setSucursal = useAuthStore((s) => s.setSucursal);
  const navigate = useNavigate();

  useEffect(() => {
    if (!sucursalesDisponibles) {
      navigate('/login', { replace: true });
    }
  }, [sucursalesDisponibles, navigate]);

  if (!sucursalesDisponibles) {
    return null;
  }

  function elegir(sucursalId: number) {
    const sucursal = sucursalesDisponibles?.find((s) => s.suc_id === sucursalId);
    if (!sucursal) {
      return;
    }
    setSucursal(sucursal);
    navigate('/');
  }

  return (
    <div className="flex w-full flex-col items-center gap-6 text-center">
      <h1 className="text-totem-xl font-bold">Elegi la sucursal</h1>

      <div className="flex w-full flex-col gap-4">
        {sucursalesDisponibles.map((sucursal) => (
          <button
            key={sucursal.suc_id}
            type="button"
            onClick={() => elegir(sucursal.suc_id)}
            className="w-full rounded-full bg-totem-success py-6 text-totem-lg font-bold capitalize text-white shadow-md focus-visible:outline focus-visible:outline-4 focus-visible:outline-totem-navy"
          >
            {sucursal.suc_nom}
          </button>
        ))}
      </div>
    </div>
  );
}
