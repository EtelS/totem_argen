# Totem de Recepcion

Totem de Recepcion, pensado para instalarse en distintas clinicas. Frontend
React (`frontend/`) que consume el backend `TotemApi` (`backend/`), con los
stored procedures en `base de datos/`.

## 1. Requisitos previos

- Node.js 20+ y npm.
- Visual Studio 2022 (backend .NET Framework 4.8) e IIS / IIS Express.

## 2. Levantar el proyecto

1. Levantar el backend (ver seccion 7) desde Visual Studio; IIS Express
   queda en `http://localhost:62301`.
2. Verificar la URL de la API en `frontend/src/config.ts`
   (`API_BASE_URL`). Para pruebas locales: `http://localhost:62301`.
3. Levantar el frontend:

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

Abrir <http://localhost:5173/TotemArgensoft/>.

### Publicar el frontend en IIS

Se publica en <https://www.argensoft.net/TotemArgensoft/>. La subruta esta
fijada en `base` de `frontend/vite.config.ts` y el router la toma de ahi.

1. En `frontend/src/config.ts`, cambiar `API_BASE_URL` por la URL publica
   de TotemApi (ej. `https://www.argensoft.net/WebServices/TotemApi`).
2. Compilar:

   ```bash
   cd frontend
   npm run build
   ```

3. Copiar el contenido de `frontend/dist/` (incluye `web.config`) a la
   carpeta `TotemArgensoft` del sitio en IIS.
4. Volver `API_BASE_URL` a `http://localhost:62301` para seguir probando
   en local.

Requisitos en IIS: modulo **URL Rewrite** instalado (el `web.config`
redirige todas las rutas de la SPA a `index.html`). El `web.config` sale de
`frontend/public/web.config`; si cambia la subruta, actualizar ahi tambien
la ruta de `index.html`.

## 3. Integracion con la API

Las llamadas viven en `frontend/src/api/`:

- `client.ts`: `fetch` con la base URL y el JWT de la sesion. Un 401 en una
  llamada autenticada cierra la sesion y el totem vuelve al login.
- `auth.ts`: `login` y `refrescarToken`.
- `atencion.ts`: `buscarAtencion(sucursalId, dni)`.

La decision turno/derivado la toma el backend (`AtencionService`). Al
arrancar, el totem renueva su token (`api/auth/refresh`), asi que se
mantiene logueado mientras se use dentro de los 30 dias de vigencia.

## 4. Flujo de la aplicacion

1. **Login y sucursal** (una sola vez por totem): al abrir la URL sin una
   sesion guardada, se pide usuario y contrasena (`/login`). Si son
   validos, se resuelve la sucursal a partir del usuario:
   - Si el usuario tiene una sola sucursal, se autoselecciona y arranca
     directo en la pantalla de bienvenida (`/`).
   - Si tiene mas de una, se pide elegirla (`/seleccionar-sucursal`)
     mostrando el `suc_nom` de cada una.
   La sesion (usuario + token + sucursal) queda guardada en `localStorage`, asi que
   en una recarga o reinicio del totem ya configurado no se vuelve a pedir
   login.
2. El paciente ingresa su DNI con el teclado numerico (`/`).
   - Si tiene **varios turnos hoy** en la sucursal del totem, elige cual
     confirmar (`/seleccionar-turno`). Con uno solo se sigue directo.
   - El flujo depende de la configuracion de la mutual del turno (o la del
     paciente si el turno no tiene) en la sucursal del totem, tabla
     `BDTurnero..SucursalPorMutual`:
     - `TotemAutogestion` = 0, NULL o sin fila: se deriva a Recepcion (paso 4),
       como un turno particular.
     - `TotemAutogestion` = 1: autogestion en el totem (paso 3).
3. Si la mutual del turno tiene autogestion:
   - Si `PideCodigoSeguridad` = 1, se pide el token de la mutual (`/token`).
     **Por ahora el token solo se solicita**: no se valida ni se guarda
     (la validacion contra el servicio de la mutual aun no existe). Al
     ingresarlo se confirma el turno (`/confirmacion`) avisando que lo
     llamaran por consultorio.
   - Si no pide codigo de seguridad, se confirma el turno directamente:
     prestador, fecha, hora y mutual (`/confirmacion`).
4. Si la mutual del turno no tiene autogestion, el paciente no tiene turno para el dia de hoy, o no se
   encuentra, se le asigna un numero de orden progresivo y
   se lo deriva a Recepcion (`/confirmacion`). Si el DNI pertenece a un
   paciente conocido (aunque sea particular o sin turno hoy), se muestra su
   nombre en la pantalla de derivacion.
5. El boton "Necesito ayuda" (visible en todas las pantallas del flujo de
   paciente) lleva a `/ayuda`.

## 5. Flujo de prueba

Requiere los SPs impactados y un usuario de `BdCentral..Usuario` con
`Sistema = 45`. Con un paciente que tenga turno hoy en la sucursal del
totem y mutual con `TotemAutogestion = 1` en `SucursalPorMutual` se confirma el turno; con varios
turnos hoy se pide elegir uno; cualquier otro DNI de 7-8 digitos recibe
numero de orden.

## 6. Tests

Los tests del frontend no usan el backend: stubbean `fetch`
(`frontend/src/tests/fetchMock.ts`).

```bash
cd frontend
npm install
npm test
```

## 7. Backend (TotemApi)

ASP.NET Web API 2 (.NET Framework 4.8) + Dapper, publicado en IIS. Mismo
esquema que `chatwoot_propio/backend` (CrmApi).

### Configuracion

Los secretos no se versionan. Copiar
`backend/TotemApi/Web.secrets.config.example` a
`backend/TotemApi/Web.secrets.config` y completar `RutaConexion` y
`JwtSecret` (32+ caracteres aleatorios). El publish lo incluye si existe.

### Compilar y publicar

Abrir `backend/TotemApi.sln` en Visual Studio 2022 (restaura los paquetes
NuGet) y publicar con el perfil `FolderProfile` (`D:\publicar\totem`). En
IIS: Application Pool con .NET CLR v4.0, pipeline integrado.

### Endpoints

| Metodo | Ruta | Auth | Descripcion |
| --- | --- | --- | --- |
| POST | `api/auth/login` | No | `{ NombreUsuario, Contrasena }` → `{ Token, Usuario, Sucursales: [{ Codigo, Nombre }] }` |
| POST | `api/auth/refresh` | JWT | Renueva el token |
| GET | `api/atencion?sucursal={id}&dni={dni}` | JWT | `{ Tipo: "turnos" \| "derivado", Paciente, Turnos: [{ Codigo, Fecha, Hora, Prestador, Mutual, Autogestion, PideCodigoSeguridad }] }` (turnos de hoy en la sucursal pendientes, `Estado = 1`) |
| POST | `api/atencion/confirmar` | JWT | `{ Sucursal, Dni, TurnoCodigo }` → marca el turno con `Estado = 2`. 404 si no es de hoy, del paciente, no esta pendiente o su mutual no tiene `TotemAutogestion = 1` |

El cliente se toma del JWT, nunca de la query. El token dura 30 dias por
defecto (`JwtExpirationMinutes`), porque el totem queda logueado.

### Base de datos

Los scripts estan en `base de datos/` (misma estructura que
`chatwoot_propio`) y **se impactan manualmente**:

- `Procedimientos/`: `spTotemAuthUsuarioSel`, `spTotemUsuarioPorCodigoSel`,
  `spTotemSucursalesSel`, `spTotemAtencionPorDniSel`,
  `spTotemTurnoConfirmarUpd`.
- `Diagnostico/01_diagnostico_columnas_totem.sql`: ejecutar antes de impactar
  los SPs para confirmar las columnas asumidas.

Estados de turno usados: `1` = pendiente (el unico que muestra el totem),
`2` = confirmado en el totem. Solo se confirman turnos cuya mutual tiene
`TotemAutogestion = 1` en la sucursal; el resto va a Recepcion sin cambiar
de estado.

Usuarios: `BdCentral..Usuario` (`Sistema = 45`). Sucursales:
`BdCentral..Sucursal` con `ClienteId = Usuario.Cliente`. Turnos y pacientes:
`BDTurnero`. La validacion del token de la mutual queda fuera de alcance del
backend.

## 8. Estructura del proyecto

```text
totem_argen/
├── backend/
│   └── TotemApi/      # Controllers, Data (SqlServices), Helpers (JWT),
│                      # Models, Services
├── base de datos/     # Procedimientos, Diagnostico
└── frontend/
    └── src/
        ├── pages/         # Login, SeleccionarSucursal, Bienvenida,
        │                  # SeleccionarTurno, Token, Confirmacion, Ayuda,
        │                  # ErrorPage
        ├── hooks/         # useElegirTurno
        ├── components/    # LayoutKiosco, RequireSesion, TecladoNumerico,
        │                  # TecladoAlfanumerico, BotonAyuda
        ├── store/         # useTotemStore, useAuthStore (zustand)
        └── api/           # client (fetch + JWT), auth, atencion
```

## 9. Pendiente / fuera de alcance

- El token de la mutual no lo provee el backend, asi que la pantalla
  `/token` no se usa hasta definir de donde sale.
- No hay persistencia real del flujo de paciente: el contador de numeros de
  orden y el DNI ingresado se reinician al recargar la pagina (a diferencia
  de la sesion de login/sucursal, que si persiste en `localStorage`).
- No hay opcion de "cerrar sesion" para cambiar de usuario/sucursal en un
  totem ya configurado.
- No hay pantalla de sala de espera (`/tv`) en esta version.
