-- ============================================================
-- Procedimiento: spTotemTotemRecepcionSel
-- Propósito: Obtener los totems de recepción de una sucursal.
--            Solo devuelve filas si la sucursal es del cliente.
-- ============================================================
-- exec spTotemTotemRecepcionSel 11, 16
IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'spTotemTotemRecepcionSel')
    DROP PROCEDURE [dbo].[spTotemTotemRecepcionSel]
GO

CREATE PROCEDURE [dbo].[spTotemTotemRecepcionSel]
    @Cliente INT,
    @Sucursal INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        s.Codigo,
        s.Nombre
    FROM BDTurnero..TotemRecepcion s
    WHERE s.SucursalId = @Sucursal
      AND EXISTS (
          SELECT 1
          FROM BdCentral..Sucursal su
          WHERE su.Codigo = @Sucursal
            AND su.ClienteId = @Cliente
      )
    ORDER BY s.Nombre
END
GO
