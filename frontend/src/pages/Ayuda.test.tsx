import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { Ayuda } from './Ayuda';

describe('Ayuda', () => {
  it('muestra la confirmacion de notificacion a recepcion', () => {
    render(
      <MemoryRouter>
        <Ayuda />
      </MemoryRouter>,
    );

    expect(screen.getByText(/Se notifico a Recepcion/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Volver al inicio' })).toBeInTheDocument();
  });
});
