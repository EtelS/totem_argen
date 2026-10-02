-- ============================================================
-- Procedimiento: spTotemSucursalesSel
-- Propósito: Obtener las sucursales del cliente al que pertenece el usuario
-- ============================================================
-- exec spTotemSucursalesSel 11
IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'spTotemSucursalesSel')
    DROP PROCEDURE [dbo].[spTotemSucursalesSel]
GO

CREATE PROCEDURE [dbo].[spTotemSucursalesSel]
    @Cliente INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        s.Codigo,
        s.Nombre
    FROM BdCentral..Sucursal s
    WHERE s.ClienteId = @Cliente
		and Activo = 1
    ORDER BY s.Nombre
END
GO
