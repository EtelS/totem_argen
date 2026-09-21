import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { ErrorPage } from './ErrorPage';

describe('ErrorPage', () => {
  it('muestra el mensaje de error y las acciones disponibles', () => {
    render(
      <MemoryRouter>
        <ErrorPage />
      </MemoryRouter>,
    );

    expect(screen.getByText('Ocurrio un problema')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Necesito ayuda' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reintentar' })).toBeInTheDocument();
  });
});
