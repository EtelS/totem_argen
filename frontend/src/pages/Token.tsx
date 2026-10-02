import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TecladoNumerico } from '../components/TecladoNumerico';
import { BotonAyuda } from '../components/BotonAyuda';
import { useTotemStore } from '../store/useTotemStore';
import { useConfirmarTurno } from '../hooks/useConfirmarTurno';

/**
 * Pantalla de token (`/token`) para mutuales con PideCodigoSeguridad en la
 * sucursal. Por ahora el token solo se solicita: no se valida ni se guarda
 * hasta que exista la integracion con el servicio de la mutual.
 */
export function Token() {
  const pendienteToken = useTotemStore((s) => s.pendienteToken);
  const setPendienteToken = useTotemStore((s) => s.setPendienteToken);
  const navigate = useNavigate();
  const confirmar = useConfirmarTurno();

  const [valor, setValor] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (!pendienteToken) {
      navigate('/');
    }
  }, [pendienteToken, navigate]);

  if (!pendienteToken) {
    return null;
  }

  async function continuar() {
    if (!pendienteToken) {
      return;
    }

    if (!valor) {
      setError('Ingresa el token de tu mutual');
      return;
    }

    // TODO: validate the token against the mutual's service once it exists.
    setError(null);
    setEnviando(true);
    // Cleared after confirming: clearing first would trigger the redirect to '/' above.
    await confirmar(pendienteToken.paciente, pendienteToken.turno);
    setPendienteToken(null);
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
        disabled={enviando}
        className="w-full rounded-full bg-totem-success py-6 text-totem-lg font-bold text-white shadow-md disabled:opacity-50 focus-visible:outline focus-visible:outline-4 focus-visible:outline-totem-navy"
      >
        Continuar
      </button>

      <BotonAyuda />
    </div>
  );
}
