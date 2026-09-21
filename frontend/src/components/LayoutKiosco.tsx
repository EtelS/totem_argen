import { PropsWithChildren } from 'react';

/**
 * Layout "modo kiosco": sin barra de navegacion, alto contraste, fuentes
 * grandes.
 */
export function LayoutKiosco({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen bg-totem-bg text-totem-navy">
      <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-6 py-10">
        {children}
      </main>
    </div>
  );
}
