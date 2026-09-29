import { vi } from 'vitest';

export function respuestaJson(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export function mockFetch(...respuestas: Response[]) {
  const fetchMock = vi.fn();
  respuestas.forEach((r) => fetchMock.mockResolvedValueOnce(r));
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}
