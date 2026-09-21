import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TecladoAlfanumerico } from '../components/TecladoAlfanumerico';
import { useAuthStore } from '../store/useAuthStore';
import { login } from '../mock/login';

type CampoActivo = 'usuario' | 'contrasena';

/**
 * Pantalla de login (`/login`), primer paso al configurar el totem en una
 * clinica: usuario + contrasena. La sucursal se resuelve despues, segun la
 * respuesta de `login` (ver Bienvenida/App para el resto del flujo).
 */
export function Login() {
  const [usuario, setUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [campoActivo, setCampoActivo] = useState<CampoActivo>('usuario');
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  const navigate = useNavigate();
  const sucursal = useAuthStore((s) => s.sucursal);
  const setCredencialesValidadas = useAuthStore((s) => s.setCredencialesValidadas);

  useEffect(() => {
    if (sucursal) {
      navigate('/', { replace: true });
    }
  }, [sucursal, navigate]);

  if (sucursal) {
    return null;
  }

  function actualizarCampoActivo(valor: string) {
    if (campoActivo === 'usuario') {
      setUsuario(valor);
    } else {
      setContrasena(valor);
    }
  }

  async function ingresar() {
    if (!usuario || !contrasena) {
      setError('Ingresa usuario y contrasena');
      return;
    }

    setError(null);
    setCargando(true);

    try {
      const resultado = await login(usuario, contrasena);

      if (!resultado.ok) {
        setError('Usuario o contrasena incorrectos');
        return;
      }

      setCredencialesValidadas(resultado.usuario, resultado.sucursales);

      if (resultado.sucursales.length === 1) {
        navigate('/');
      } else {
        navigate('/seleccionar-sucursal');
      }
    } catch {
      navigate('/error');
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="flex w-full flex-col items-center gap-6 text-center">
      <h1 className="text-totem-xl font-bold">Iniciar sesion</h1>
      <p className="text-totem-lg">Configuracion del totem</p>

      <button
        type="button"
        onClick={() => setCampoActivo('usuario')}
        className={`w-full rounded-2xl border px-8 py-5 text-2xl tracking-widest shadow-sm ${
          campoActivo === 'usuario' ? 'border-totem-accent bg-totem-panel' : 'border-totem-border bg-totem-panel'
        }`}
        aria-label="Campo usuario"
      >
        {usuario || 'Usuario'}
      </button>

      <button
        type="button"
        onClick={() => setCampoActivo('contrasena')}
        className={`w-full rounded-2xl border px-8 py-5 text-2xl tracking-widest shadow-sm ${
          campoActivo === 'contrasena' ? 'border-totem-accent bg-totem-panel' : 'border-totem-border bg-totem-panel'
        }`}
        aria-label="Campo contrasena"
      >
        {contrasena ? '•'.repeat(contrasena.length) : 'Contrasena'}
      </button>

      {error && <p className="text-xl font-semibold text-totem-danger">{error}</p>}

      <TecladoAlfanumerico valor={campoActivo === 'usuario' ? usuario : contrasena} onCambiar={actualizarCampoActivo} />

      <button
        type="button"
        onClick={ingresar}
        disabled={cargando}
        className="w-full rounded-full bg-totem-success py-6 text-totem-lg font-bold text-white shadow-md disabled:opacity-50 focus-visible:outline focus-visible:outline-4 focus-visible:outline-totem-navy"
      >
        Ingresar
      </button>
    </div>
  );
}
