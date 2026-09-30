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
2. Crear `frontend/.env.local` con la URL del backend:

   ```ini
   VITE_API_BASE_URL=http://localhost:62301
   ```

   Si el frontend se sirve desde el mismo sitio IIS que la API, dejarla
   vacia (se usan rutas relativas `/api/...`).
3. Levantar el frontend:

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

Abrir <http://localhost:5173>.

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
   - Si el turno elegido es particular, se deriva a Recepcion (paso 4).
3. Si el turno elegido tiene mutual/obra social (no "particular"):
   - Si la mutual requiere token, se pide ingresarlo (`/token`). **Hoy el
     backend no informa tokens**, por lo que este paso no se dispara. Si
     coincide, se confirma el turno (`/confirmacion`) avisando que lo llamaran por consultorio. Si no
     coincide, se da una segunda oportunidad; si vuelve a fallar, se le
     asigna un numero de orden, se muestra su nombre y se le avisa que sera
     atendido en Recepcion (`/confirmacion`).
   - Si la mutual no requiere token, se confirma el turno directamente:
     prestador, fecha, hora y mutual (`/confirmacion`).
4. Si el paciente es particular, no tiene turno para el dia de hoy, o no se
   encuentra, se le asigna un numero de orden progresivo y
   se lo deriva a Recepcion (`/confirmacion`). Si el DNI pertenece a un
   paciente conocido (aunque sea particular o sin turno hoy), se muestra su
   nombre en la pantalla de derivacion.
5. El boton "Necesito ayuda" (visible en todas las pantallas del flujo de
   paciente) lleva a `/ayuda`.

## 5. Flujo de prueba

Requiere los SPs impactados y un usuario de `BdCentral..Usuario` con
`Sistema = 45`. Con un paciente que tenga turno hoy en la sucursal del
totem y mutual distinta de "particular" se confirma el turno; con varios
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
| GET | `api/atencion?sucursal={id}&dni={dni}` | JWT | `{ Tipo: "turnos" \| "derivado", Paciente, Turnos: [{ Codigo, Fecha, Hora, Prestador, Mutual, Particular }] }` (turnos de hoy en la sucursal pendientes, `Estado = 1`) |
| POST | `api/atencion/confirmar` | JWT | `{ Sucursal, Dni, TurnoCodigo }` → marca el turno con `Estado = 2`. 404 si no es de hoy, del paciente o no esta pendiente |

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
`2` = confirmado en el totem. Solo se confirman turnos con mutual; los
particulares van a Recepcion sin cambiar de estado.

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
