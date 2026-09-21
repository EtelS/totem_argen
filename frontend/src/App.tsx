import { Route, Routes } from 'react-router-dom';
import { LayoutKiosco } from './components/LayoutKiosco';
import { RequireSesion } from './components/RequireSesion';
import { Bienvenida } from './pages/Bienvenida';
import { Token } from './pages/Token';
import { Confirmacion } from './pages/Confirmacion';
import { ErrorPage } from './pages/ErrorPage';
import { Ayuda } from './pages/Ayuda';
import { Login } from './pages/Login';
import { SeleccionarSucursal } from './pages/SeleccionarSucursal';

export default function App() {
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
