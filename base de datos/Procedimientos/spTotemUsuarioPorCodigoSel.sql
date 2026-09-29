-- ============================================================
-- Procedimiento: spTotemUsuarioPorCodigoSel
-- Propósito: Obtener usuario habilitado del totem por código (refresh de token)
-- ============================================================
-- exec spTotemUsuarioPorCodigoSel 1, 11
IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'spTotemUsuarioPorCodigoSel')
    DROP PROCEDURE [dbo].[spTotemUsuarioPorCodigoSel]
GO

CREATE PROCEDURE [dbo].[spTotemUsuarioPorCodigoSel]
    @Codigo INT,
    @Cliente INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        Codigo,
        NombreUsuario,
        NombreCompleto,
        Cliente,
        Habilitado
    FROM BdCentral..Usuario
    WHERE Codigo = @Codigo
      AND Cliente = @Cliente
      AND Habilitado = 1
      AND Sistema = 45
END
GO
