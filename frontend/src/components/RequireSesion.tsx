import { PropsWithChildren, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

/**
 * Protege las pantallas del flujo de paciente: si el totem todavia no tiene
 * una sesion (token + sucursal) configurada, redirige al login.
 */
export function RequireSesion({ children }: PropsWithChildren) {
  const sesionActiva = useAuthStore((s) => Boolean(s.token && s.sucursal));
  const navigate = useNavigate();

  useEffect(() => {
    if (!sesionActiva) {
      navigate('/login', { replace: true });
    }
  }, [sesionActiva, navigate]);

  if (!sesionActiva) {
    return null;
  }

  return <>{children}</>;
}
