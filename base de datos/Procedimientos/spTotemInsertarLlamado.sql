-- ============================================================
-- Procedimiento: spTotemInsertarLlamado
-- Propósito: Registrar en la cola de Recepción (TurnoTotemRecepcion) a
--            quien pasa por el totem: el paciente que eligió un turno, el
--            que no tiene turno hoy, o un DNI que no existe
--            (@CodigoPaciente = NULL -> PacienteId NULL).
--            Genera el número de llamado: correlativo diario por sucursal
--            (MAX del día + 1, con lock para que dos totems no repitan número).
--            Solo inserta si la sucursal es del cliente y, cuando se informa
--            @CodigoPaciente, si el paciente es del cliente y tiene ese DNI.
--            Devuelve Numero = número asignado; sin filas si no se insertó.
-- ============================================================
-- exec spTotemInsertarLlamado 11, 16, '31056851', 2403153
-- exec spTotemInsertarLlamado 11, 16, '11111111', NULL
IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'spTotemInsertarLlamado')
    DROP PROCEDURE [dbo].[spTotemInsertarLlamado]
GO

CREATE PROCEDURE [dbo].[spTotemInsertarLlamado]
    @Cliente INT,
    @SucursalId INT,
    @Dni VARCHAR(10),
    @CodigoPaciente INT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    IF (@CodigoPaciente IS NOT NULL AND NOT EXISTS (
        SELECT 1
        FROM BDTurnero..Paciente p
        WHERE p.Codigo = @CodigoPaciente
          AND p.Cliente = @Cliente
          AND p.DocumentoNro = @Dni COLLATE Modern_Spanish_CI_AS
    ))
    OR NOT EXISTS (
        SELECT 1
        FROM BdCentral..Sucursal s
        WHERE s.Codigo = @SucursalId
          AND s.ClienteId = @Cliente
    )
        RETURN;

    DECLARE @Hoy DATE = CAST(GETDATE() AS DATE);
    DECLARE @Manana DATE = DATEADD(DAY, 1, @Hoy);
    DECLARE @NumeroLlamado INT;

    BEGIN TRAN;

    -- UPDLOCK + HOLDLOCK: serializa a los totems de la misma sucursal hasta el COMMIT.
    SELECT @NumeroLlamado = ISNULL(MAX(ttr.NumeroIdentificadorDiario), 0) + 1
    FROM BDTurnero..TurnoTotemRecepcion ttr WITH (UPDLOCK, HOLDLOCK)
    WHERE ttr.SucursalId = @SucursalId
      AND ttr.FechaRegistro >= @Hoy
      AND ttr.FechaRegistro < @Manana;

    INSERT BDTurnero..TurnoTotemRecepcion (NumeroIdentificadorDiario, PacienteId, FechaRegistro, FechaLlamado, EstadoTurnoTotemRecepcionId, CategoriaTotemRecepcionId, BoxRecepcionId, TotemRecepcionId, SucursalId, LogFecha)
    VALUES (@NumeroLlamado, @CodigoPaciente, GETDATE(), NULL, 1, 3, NULL, 1, @SucursalId, GETDATE());

    COMMIT;

    SELECT @NumeroLlamado AS Numero;
END
GO
