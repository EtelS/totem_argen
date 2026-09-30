-- ============================================================
-- Procedimiento: spTotemTurnoConfirmarUpd
-- Propósito: Confirmar desde el totem un turno de HOY del paciente,
--            asignándole Estado = 2.
--            Solo actualiza si el turno es del paciente (DNI + Cliente),
--            de la sucursal del totem, de hoy y está pendiente (Estado = 1).
--            Devuelve Filas = 1 si se confirmó, 0 si no cumple las condiciones.
-- ============================================================
-- exec spTotemTurnoConfirmarUpd 11, 16, '30738807', 12345
IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'spTotemTurnoConfirmarUpd')
    DROP PROCEDURE [dbo].[spTotemTurnoConfirmarUpd]
GO

CREATE PROCEDURE [dbo].[spTotemTurnoConfirmarUpd]
    @Cliente INT,
    @SucursalId INT,
    @Dni VARCHAR(10),
    @TurnoId INT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @Hoy DATE = CAST(GETDATE() AS DATE);
    DECLARE @Manana DATE = DATEADD(DAY, 1, @Hoy);

    UPDATE t
    SET t.Estado = 2
    FROM BDTurnero..Turno t
    INNER JOIN BDTurnero..Paciente p
        ON p.Codigo = t.Paciente
    INNER JOIN BdCentral..Sucursal s
        ON s.Codigo = t.SucursalId
       AND s.ClienteId = @Cliente
    WHERE t.Codigo = @TurnoId
      AND t.SucursalId = @SucursalId
      AND p.Cliente = @Cliente
      AND p.DocumentoNro = @Dni COLLATE Modern_Spanish_CI_AS
      AND t.Fecha >= @Hoy
      AND t.Fecha < @Manana
      AND t.Estado = 1;

    SELECT @@ROWCOUNT AS Filas;
END
GO
