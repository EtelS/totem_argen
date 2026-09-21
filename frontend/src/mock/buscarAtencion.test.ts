import { describe, expect, it } from 'vitest';
import { buscarAtencion } from './buscarAtencion';

describe('buscarAtencion', () => {
  it('confirma el turno cuando el DNI tiene turno y mutual/obra social', () => {
    const resultado = buscarAtencion('30738807');

    expect(resultado.tipo).toBe('turno');
    if (resultado.tipo === 'turno') {
      expect(resultado.paciente.nombreYApellido).toBe('Etel Perez');
      expect(resultado.turno.prestador).toBe('Romo Guillermo');
    }
  });

  it('deriva a Recepcion cuando el paciente es particular, incluyendo su nombre', () => {
    const resultado = buscarAtencion('29712252');

    expect(resultado.tipo).toBe('derivado');
    if (resultado.tipo === 'derivado') {
      expect(resultado.paciente?.nombreYApellido).toBe('Mauro Herrera');
    }
  });

  it('deriva a Recepcion cuando el DNI no se encuentra', () => {
    const resultado = buscarAtencion('11111111');

    expect(resultado).toEqual({ tipo: 'derivado' });
  });

  it('deriva a Recepcion cuando el paciente tiene turno pero no es de hoy', () => {
    const resultado = buscarAtencion('31234567');

    expect(resultado.tipo).toBe('derivado');
    if (resultado.tipo === 'derivado') {
      expect(resultado.paciente?.nombreYApellido).toBe('Carlos Gimenez');
    }
  });
});
