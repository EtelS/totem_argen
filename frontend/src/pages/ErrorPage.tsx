import { useNavigate } from 'react-router-dom';

export function ErrorPage() {
  const navigate = useNavigate();

  return (
    <div className="flex w-full flex-col items-center gap-8 text-center">
      <h1 className="text-totem-xl font-bold text-totem-danger">Ocurrio un problema</h1>
      <p className="text-totem-lg">
        No pudimos conectar con el sistema. Por favor pedi ayuda o intenta nuevamente.
      </p>

      <button
        type="button"
        onClick={() => navigate('/ayuda')}
        className="w-full rounded-full bg-totem-danger py-6 text-totem-lg font-bold text-white shadow-md focus-visible:outline focus-visible:outline-4 focus-visible:outline-totem-navy"
      >
        Necesito ayuda
      </button>

      <button
        type="button"
        onClick={() => navigate('/')}
        className="w-full rounded-full border-2 border-totem-navy py-4 text-xl font-semibold text-totem-navy"
      >
        Reintentar
      </button>
    </div>
  );
}
