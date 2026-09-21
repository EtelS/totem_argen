interface TecladoAlfanumericoProps {
  valor: string;
  onCambiar: (valor: string) => void;
  maxLength?: number;
}

const FILAS = [
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
  ['z', 'x', 'c', 'v', 'b', 'n', 'm'],
  ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
];

export function TecladoAlfanumerico({ valor, onCambiar, maxLength = 32 }: TecladoAlfanumericoProps) {
  function presionar(tecla: string) {
    if (valor.length >= maxLength) {
      return;
    }
    onCambiar(valor + tecla);
  }

  function borrar() {
    onCambiar(valor.slice(0, -1));
  }

  function limpiar() {
    onCambiar('');
  }

  return (
    <div className="flex w-full flex-col gap-2" role="group" aria-label="Teclado alfanumerico">
      {FILAS.map((fila, indice) => (
        <div key={indice} className="flex justify-center gap-2">
          {fila.map((tecla) => (
            <button
              key={tecla}
              type="button"
              onClick={() => presionar(tecla)}
              className="flex-1 rounded-xl bg-totem-key py-4 text-xl font-semibold text-totem-navy shadow hover:bg-totem-accent hover:text-white focus-visible:outline focus-visible:outline-4 focus-visible:outline-totem-accent"
              aria-label={`Letra o digito ${tecla}`}
            >
              {tecla}
            </button>
          ))}
        </div>
      ))}
      <div className="flex justify-center gap-2">
        <button
          type="button"
          onClick={limpiar}
          className="flex-1 rounded-xl bg-totem-key py-4 text-xl font-semibold text-totem-navy shadow hover:bg-totem-accent hover:text-white focus-visible:outline focus-visible:outline-4 focus-visible:outline-totem-accent"
          aria-label="Limpiar"
        >
          C
        </button>
        <button
          type="button"
          onClick={borrar}
          className="flex-1 rounded-xl bg-totem-key py-4 text-xl font-semibold text-totem-navy shadow hover:bg-totem-accent hover:text-white focus-visible:outline focus-visible:outline-4 focus-visible:outline-totem-accent"
          aria-label="Borrar ultimo caracter"
        >
          ⌫
        </button>
      </div>
    </div>
  );
}
