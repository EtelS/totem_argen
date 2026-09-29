import { useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import { refrescarToken } from './api/auth';
import { useAuthStore } from './store/useAuthStore';
import { LayoutKiosco } from './components/LayoutKiosco';
import { RequireSesion } from './components/RequireSesion';
import { Bienvenida } from './pages/Bienvenida';
import { Token } from './pages/Token';
import { Confirmacion } from './pages/Confirmacion';
import { ErrorPage } from './pages/ErrorPage';
import { Ayuda } from './pages/Ayuda';
import { Login } from './pages/Login';
import { SeleccionarSucursal } from './pages/SeleccionarSucursal';
import { SeleccionarTurno } from './pages/SeleccionarTurno';

export default function App() {
  useEffect(() => {
    // Sliding session: renewing on every start keeps an installed totem logged in
    // as long as it is used within the token expiry window.
    if (!useAuthStore.getState().token) {
      return;
    }
    refrescarToken()
      .then((token) => useAuthStore.getState().setToken(token))
      .catch(() => {
        // A 401 already closed the session; network errors keep the current token.
      });
  }, []);

  return (
    <Routes>
      <Route
        path="/login"
        element={
          <LayoutKiosco>
            <Login />
          </LayoutKiosco>
        }
      />
      <Route
        path="/seleccionar-sucursal"
        element={
          <LayoutKiosco>
            <SeleccionarSucursal />
          </LayoutKiosco>
        }
      />
      <Route
        path="/"
        element={
          <LayoutKiosco>
            <RequireSesion>
              <Bienvenida />
            </RequireSesion>
          </LayoutKiosco>
        }
      />
      <Route
        path="/seleccionar-turno"
        element={
          <LayoutKiosco>
            <RequireSesion>
              <SeleccionarTurno />
            </RequireSesion>
          </LayoutKiosco>
        }
      />
      <Route
        path="/token"
        element={
          <LayoutKiosco>
            <RequireSesion>
              <Token />
            </RequireSesion>
          </LayoutKiosco>
        }
      />
      <Route
        path="/confirmacion"
        element={
          <LayoutKiosco>
            <RequireSesion>
              <Confirmacion />
            </RequireSesion>
          </LayoutKiosco>
        }
      />
      <Route
        path="/error"
        element={
          <LayoutKiosco>
            <RequireSesion>
              <ErrorPage />
            </RequireSesion>
          </LayoutKiosco>
        }
      />
      <Route
        path="/ayuda"
        element={
          <LayoutKiosco>
            <RequireSesion>
              <Ayuda />
            </RequireSesion>
          </LayoutKiosco>
        }
      />
    </Routes>
  );
}
