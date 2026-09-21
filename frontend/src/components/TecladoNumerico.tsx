interface TecladoNumericoProps {
  valor: string;
  onCambiar: (valor: string) => void;
  maxLength?: number;
}

const TECLAS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'borrar', '0', 'limpiar'];

export function TecladoNumerico({ valor, onCambiar, maxLength = 8 }: TecladoNumericoProps) {
  function presionar(tecla: string) {
    if (tecla === 'borrar') {
      onCambiar(valor.slice(0, -1));
      return;
    }
    if (tecla === 'limpiar') {
      onCambiar('');
      return;
    }
    if (valor.length >= maxLength) {
      return;
    }
    onCambiar(valor + tecla);
  }

  return (
    <div
      className="grid grid-cols-3 gap-4"
      role="group"
      aria-label="Teclado numerico para ingresar DNI"
    >
      {TECLAS.map((tecla) => (
        <button
          key={tecla}
          type="button"
          onClick={() => presionar(tecla)}
          className="rounded-2xl bg-totem-key py-8 text-totem-lg font-semibold text-totem-navy shadow hover:bg-totem-accent hover:text-white focus-visible:outline focus-visible:outline-4 focus-visible:outline-totem-accent"
          aria-label={tecla === 'borrar' ? 'Borrar ultimo digito' : tecla === 'limpiar' ? 'Limpiar' : `Digito ${tecla}`}
        >
          {tecla === 'borrar' ? '⌫' : tecla === 'limpiar' ? 'C' : tecla}
        </button>
      ))}
    </div>
  );
}
