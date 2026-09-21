import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { Bienvenida } from './Bienvenida';

describe('Bienvenida', () => {
  it('muestra el titulo y el teclado numerico', () => {
    render(
      <MemoryRouter>
        <Bienvenida />
      </MemoryRouter>,
    );

    expect(screen.getByText('Bienvenido/a')).toBeInTheDocument();
    expect(screen.getByText('Ingresa tu numero de DNI')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Continuar' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Necesito ayuda' })).toBeInTheDocument();
  });
});
