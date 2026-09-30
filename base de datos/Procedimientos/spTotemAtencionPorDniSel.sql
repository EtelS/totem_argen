-- ============================================================
-- Procedimiento: spTotemAtencionPorDniSel
-- Propósito: Obtener el paciente por DNI + Cliente y TODOS sus turnos
--            de HOY en la sucursal del totem.
--            Devuelve dos result sets:
--              1) Paciente (0 o 1 fila). Sin filas = paciente no encontrado.
--              2) Turnos de hoy en la sucursal pendientes de confirmar
--                 (Estado = 1), ordenados por hora (0..N filas).
--                 Sin filas = paciente sin turnos pendientes hoy.
-- ============================================================
-- exec spTotemAtencionPorDniSel 11, 16, '30738807'
IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'spTotemAtencionPorDniSel')
    DROP PROCEDURE [dbo].[spTotemAtencionPorDniSel]
GO

CREATE PROCEDURE [dbo].[spTotemAtencionPorDniSel]
    @Cliente INT,
    @SucursalId INT,
    @Dni VARCHAR(10)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @Hoy DATE = CAST(GETDATE() AS DATE);
    DECLARE @Manana DATE = DATEADD(DAY, 1, @Hoy);

    -- Un DNI puede estar repetido para el mismo cliente: se toman los turnos
    -- de todos los registros de paciente con ese DNI.
    DECLARE @Pacientes TABLE (
        Codigo INT NOT NULL PRIMARY KEY,
        Dni VARCHAR(20) NULL,
        NombreYApellido VARCHAR(250) NULL,
        MutualPaciente VARCHAR(200) NULL
    );

    INSERT INTO @Pacientes (Codigo, Dni, NombreYApellido, MutualPaciente)
    SELECT
        p.Codigo,
        p.DocumentoNro,
        LTRIM(RTRIM(ISNULL(p.Nombre, '') + ' ' + ISNULL(p.Apellido, ''))),
        mp.Nombre
    FROM BDTurnero..Paciente p
    LEFT JOIN BDTurnero..Mutual mp
        ON mp.Codigo = p.MutualId
    WHERE p.Cliente = @Cliente
      AND p.DocumentoNro = @Dni COLLATE Modern_Spanish_CI_AS;

    -- 1) Paciente: se prioriza el registro que tiene turno hoy, luego el más reciente.
    SELECT TOP 1
        pa.Dni,
        pa.NombreYApellido,
        pa.MutualPaciente
    FROM @Pacientes pa
    ORDER BY
        CASE WHEN EXISTS (
            SELECT 1
            FROM BDTurnero..Turno t
            WHERE t.Paciente = pa.Codigo
              AND t.SucursalId = @SucursalId
              AND t.Fecha >= @Hoy
              AND t.Fecha < @Manana
              AND t.Estado = 1
        ) THEN 0 ELSE 1 END,
        pa.Codigo DESC;

    -- 2) Turnos de hoy en la sucursal del totem pendientes de confirmar (Estado = 1).
    SELECT
        t.Codigo,
        t.Fecha,
		LEFT(CONVERT(VARCHAR(8), t.Hora, 108), 5) AS Hora,
        LTRIM(RTRIM(ISNULL(pre.Apellido, '') + ' ' + ISNULL(pre.Nombre, ''))) AS Prestador,
        ISNULL(m.Nombre, pa.MutualPaciente) AS Mutual
    FROM @Pacientes pa
    INNER JOIN BDTurnero..Turno t
        ON t.Paciente = pa.Codigo
    INNER JOIN BdCentral..Sucursal s
        ON s.Codigo = t.SucursalId
       AND s.ClienteId = @Cliente
    LEFT JOIN BDTurnero..Prestador pre
        ON pre.Codigo = t.Prestador
    LEFT JOIN BDTurnero..Mutual m
        ON m.Codigo = t.Mutual
    WHERE t.SucursalId = @SucursalId
      AND t.Fecha >= @Hoy
      AND t.Fecha < @Manana
      AND t.Estado = 1
    ORDER BY t.Hora;
END
GO
