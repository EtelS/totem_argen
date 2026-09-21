import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TecladoNumerico } from '../components/TecladoNumerico';
import { BotonAyuda } from '../components/BotonAyuda';
import { useTotemStore } from '../store/useTotemStore';

const MAX_INTENTOS = 2;

/**
 * Pantalla de token (`/token`) para mutuales que lo requieren (ej. Swiss
 * Medical). Si el token no coincide, se da una segunda oportunidad; si
 * vuelve a fallar, se deriva a Recepcion con un numero de orden.
 */
export function Token() {
  const pendienteToken = useTotemStore((s) => s.pendienteToken);
  const setPendienteToken = useTotemStore((s) => s.setPendienteToken);
  const setConfirmacion = useTotemStore((s) => s.setConfirmacion);
  const siguienteNumero = useTotemStore((s) => s.siguienteNumero);
  const navigate = useNavigate();

  const [valor, setValor] = useState('');
  const [intentos, setIntentos] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!pendienteToken) {
      navigate('/');
    }
  }, [pendienteToken, navigate]);

  if (!pendienteToken) {
    return null;
  }

  function continuar() {
    if (!pendienteToken) {
      return;
    }

    if (valor === pendienteToken.paciente.token) {
      setConfirmacion({ tipo: 'turno', paciente: pendienteToken.paciente, turno: pendienteToken.turno });
      setPendienteToken(null);
      navigate('/confirmacion');
      return;
    }

    const intentosRealizados = intentos + 1;

    if (intentosRealizados >= MAX_INTENTOS) {
      setConfirmacion({ tipo: 'derivado', numero: siguienteNumero(), paciente: pendienteToken.paciente });
      setPendienteToken(null);
      navigate('/confirmacion');
      return;
    }

    setIntentos(intentosRealizados);
    setValor('');
    setError('Token incorrecto. Intenta nuevamente.');
  }

  return (
    <div className="flex w-full flex-col items-center gap-8 text-center">
      <h1 className="text-totem-xl font-bold">Ingresa tu token</h1>
      <p className="text-totem-lg">{pendienteToken.paciente.nombreYApellido}</p>

      <div
        className="w-full rounded-2xl border border-totem-border bg-totem-panel px-8 py-6 text-totem-xl tracking-widest shadow-sm"
        aria-live="polite"
      >
        {valor || '____'}
      </div>

      {error && <p className="text-xl font-semibold text-totem-danger">{error}</p>}

      <TecladoNumerico valor={valor} onCambiar={setValor} maxLength={8} />

      <button
        type="button"
        onClick={continuar}
        className="w-full rounded-full bg-totem-success py-6 text-totem-lg font-bold text-white shadow-md disabled:opacity-50 focus-visible:outline focus-visible:outline-4 focus-visible:outline-totem-navy"
      >
        Continuar
      </button>

      <BotonAyuda />
    </div>
  );
}
