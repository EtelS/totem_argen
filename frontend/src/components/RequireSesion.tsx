import { PropsWithChildren, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

/**
 * Protege las pantallas del flujo de paciente: si el totem todavia no tiene
 * una sesion (token + sucursal + totem de recepcion) configurada, redirige al
 * paso que falta: el login, o la eleccion del totem si ya tiene sucursal.
 */
export function RequireSesion({ children }: PropsWithChildren) {
  const sucursalElegida = useAuthStore((s) => Boolean(s.token && s.sucursal));
  const sesionActiva = useAuthStore((s) => Boolean(s.token && s.sucursal && s.totemRecepcion));
  const navigate = useNavigate();

  useEffect(() => {
    if (!sesionActiva) {
      navigate(sucursalElegida ? '/seleccionar-totem' : '/login', { replace: true });
    }
  }, [sesionActiva, sucursalElegida, navigate]);

  if (!sesionActiva) {
    return null;
  }

  return <>{children}</>;
}
