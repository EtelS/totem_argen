import { PropsWithChildren, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

/**
 * Protege las pantallas del flujo de paciente: si el totem todavia no tiene
 * una sesion (usuario + sucursal) configurada, redirige al login.
 */
export function RequireSesion({ children }: PropsWithChildren) {
  const sucursal = useAuthStore((s) => s.sucursal);
  const navigate = useNavigate();

  useEffect(() => {
    if (!sucursal) {
      navigate('/login', { replace: true });
    }
  }, [sucursal, navigate]);

  if (!sucursal) {
    return null;
  }

  return <>{children}</>;
}
