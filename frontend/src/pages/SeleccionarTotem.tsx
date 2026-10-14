import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ApiError } from '../api/client';
import { buscarTotemsRecepcion } from '../api/totemsRecepcion';
import { TotemRecepcion } from '../api/types';
import { useAuthStore } from '../store/useAuthStore';

/**
 * Pantalla de seleccion del totem de recepcion (`/seleccionar-totem`). Se
 * muestra despues de elegir la sucursal: lista los totems de esa sucursal y
 * guarda el elegido, que se envia al registrar cada llamado. Con un solo
 * totem se autoselecciona.
 */
export function SeleccionarTotem() {
  const sucursal = useAuthStore((s) => s.sucursal);
  const sesionIniciada = useAuthStore((s) => Boolean(s.token));
  const setTotemRecepcion = useAuthStore((s) => s.setTotemRecepcion);
  const navigate = useNavigate();

  const [totems, setTotems] = useState<TotemRecepcion[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sucursalId = sucursal?.suc_id;

  useEffect(() => {
    if (!sesionIniciada || sucursalId === undefined) {
      navigate('/login', { replace: true });
      return;
    }

    let cancelado = false;
    buscarTotemsRecepcion(sucursalId)
      .then((lista) => {
        if (cancelado) {
          return;
        }
        if (lista.length === 1) {
          setTotemRecepcion(lista[0]);
          navigate('/', { replace: true });
        } else {
          setTotems(lista);
        }
      })
      .catch((e) => {
        // A 401 already closed the session; RequireSesion/Login send the totem back to login.
        if (!cancelado && !(e instanceof ApiError && e.status === 401)) {
          setError('No pudimos traer los totems. Intenta nuevamente.');
        }
      });

    return () => {
      cancelado = true;
    };
  }, [sesionIniciada, sucursalId, setTotemRecepcion, navigate]);

  function elegir(totem: TotemRecepcion) {
    setTotemRecepcion(totem);
    navigate('/');
  }

  if (error) {
    return <p className="text-xl font-semibold text-totem-danger">{error}</p>;
  }

  if (!totems) {
    return null;
  }

  if (totems.length === 0) {
    return <p className="text-xl font-semibold text-totem-danger">La sucursal no tiene totems de recepcion</p>;
  }

  return (
    <div className="flex w-full flex-col items-center gap-6 text-center">
      <h1 className="text-totem-xl font-bold">Elegi el totem</h1>

      <div className="flex w-full flex-col gap-4">
        {totems.map((totem) => (
          <button
            key={totem.tot_id}
            type="button"
            onClick={() => elegir(totem)}
            className="w-full rounded-full bg-totem-success py-6 text-totem-lg font-bold capitalize text-white shadow-md focus-visible:outline focus-visible:outline-4 focus-visible:outline-totem-navy"
          >
            {totem.tot_nom}
          </button>
        ))}
      </div>
    </div>
  );
}
