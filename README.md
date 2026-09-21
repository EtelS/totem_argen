# Totem de Recepcion — Frontend (mock)

Frontend del Totem de Recepcion, pensado para instalarse en distintas
clinicas. **No tiene backend**: toda la data (usuarios/sucursales, turnos,
pacientes) es un mockup local en `frontend/src/mock/`. Pensado para
prototipar y validar el flujo de pantallas antes de conectar un backend
real.

## 1. Requisitos previos

- Node.js 20+ y npm.

## 2. Levantar el proyecto

```bash
cd frontend
npm install
npm run dev
```

Abrir http://localhost:5173.

## 3. Data mock

- `frontend/src/mock/authData.ts`: `USUARIOS_MOCK`, `{ usuario, contrasena,
  sucursales: [{ suc_id, suc_nom }] }`. Un usuario puede tener mas de una
  sucursal.
- `frontend/src/mock/data.ts`: turnos y pacientes.
  - `TURNOS_MOCK`: `{ fecha, hora, prestador, pacienteDni }`.
  - `PACIENTES_MOCK`: `{ dni, nombreYApellido, mutual, token }`.

La logica de negocio vive en `frontend/src/mock/login.ts` (login) y
`frontend/src/mock/buscarAtencion.ts` (turnos). Ambas funciones son
`async` a proposito, para poder reemplazarlas por llamadas HTTP reales sin
tocar las pantallas que las usan.

## 4. Flujo de la aplicacion

1. **Login y sucursal** (una sola vez por totem): al abrir la URL sin una
   sesion guardada, se pide usuario y contrasena (`/login`). Si son
   validos, se resuelve la sucursal a partir del usuario:
   - Si el usuario tiene una sola sucursal, se autoselecciona y arranca
     directo en la pantalla de bienvenida (`/`).
   - Si tiene mas de una, se pide elegirla (`/seleccionar-sucursal`)
     mostrando el `suc_nom` de cada una.
   La sesion (usuario + sucursal) queda guardada en `localStorage`, asi que
   en una recarga o reinicio del totem ya configurado no se vuelve a pedir
   login.
2. El paciente ingresa su DNI con el teclado numerico (`/`).
3. Si el DNI tiene un turno asociado **para el dia de hoy** y una
   mutual/obra social (no "particular"):
   - Si la mutual requiere token (el paciente tiene un `token` cargado en la
     data mock), se pide ingresarlo (`/token`). Si coincide, se confirma el
     turno (`/confirmacion`) avisando que lo llamaran por consultorio. Si no
     coincide, se da una segunda oportunidad; si vuelve a fallar, se le
     asigna un numero de orden, se muestra su nombre y se le avisa que sera
     atendido en Recepcion (`/confirmacion`).
   - Si la mutual no requiere token, se confirma el turno directamente:
     prestador, fecha, hora y mutual (`/confirmacion`).
4. Si el paciente es particular, no tiene turno para el dia de hoy, o no se
   encuentra en la data mock, se le asigna un numero de orden progresivo y
   se lo deriva a Recepcion (`/confirmacion`). Si el DNI pertenece a un
   paciente conocido (aunque sea particular o sin turno hoy), se muestra su
   nombre en la pantalla de derivacion.
5. El boton "Necesito ayuda" (visible en todas las pantallas del flujo de
   paciente) lleva a `/ayuda`.

## 5. Flujo de prueba

Login: usuario `eteltotem`, contrasena `eteltotem1234` (unica sucursal:
`clinicademo`).

Con la data mock por defecto (turnos evaluados contra la fecha de hoy):

- DNI `30738807` (Etel Perez, Swiss Medical) → turno de **hoy** con
  Romo Guillermo, 15:00 → turno confirmado (requiere token `123`).
- DNI `31234567` (Carlos Gimenez, OSDE) → tiene turno pero de una fecha
  pasada → numero de orden asignado (deriva a Recepcion).
- DNI `29712252` (Mauro Herrera, particular) → numero de orden asignado.
- Cualquier otro DNI de 7-8 digitos → numero de orden asignado (no
  encontrado).

## 6. Tests

```bash
cd frontend
npm install
npm test
```

## 7. Estructura del proyecto

```
totem_argen/
└── frontend/
    └── src/
        ├── pages/         # Login, SeleccionarSucursal, Bienvenida, Token,
        │                  # Confirmacion, Ayuda, ErrorPage
        ├── components/    # LayoutKiosco, RequireSesion, TecladoNumerico,
        │                  # TecladoAlfanumerico, BotonAyuda
        ├── store/         # useTotemStore, useAuthStore (zustand)
        └── mock/          # authData.ts/login.ts (usuarios/sucursales),
                           # data.ts/buscarAtencion.ts (turnos/pacientes)
```

## 8. Pendiente / fuera de alcance

- No hay backend real: los datos de usuarios/sucursales y turnos/pacientes
  son mocks locales, pensados para reemplazarse por llamadas HTTP
  (`frontend/src/mock/login.ts` y `frontend/src/mock/buscarAtencion.ts`).
- No hay persistencia real del flujo de paciente: el contador de numeros de
  orden y el DNI ingresado se reinician al recargar la pagina (a diferencia
  de la sesion de login/sucursal, que si persiste en `localStorage`).
- No hay opcion de "cerrar sesion" para cambiar de usuario/sucursal en un
  totem ya configurado.
- No hay pantalla de sala de espera (`/tv`) en esta version.
