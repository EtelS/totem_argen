-- ============================================================
-- Procedimiento: spTotemTotemRecepcionSel
-- Propósito: Obtener los totems de recepción de una sucursal
-- ============================================================
-- exec spTotemTotemRecepcionSel 508
IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'spTotemTotemRecepcionSel')
    DROP PROCEDURE [dbo].[spTotemTotemRecepcionSel]
GO

CREATE PROCEDURE [dbo].[spTotemTotemRecepcionSel]
    @Sucursal INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        s.Codigo,
        s.Nombre
    FROM BDTurnero..TotemRecepcion s
    WHERE s.SucursalId = @Sucursal
    ORDER BY s.Nombre
END
GO
