-- ============================================================
-- Procedimiento: spTotemAuthUsuarioSel
-- Propósito: Autenticar usuario del totem por nombre de usuario y contraseña
-- ============================================================
-- exec spTotemAuthUsuarioSel 'eteltotem', 'eteltotem1234'
IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'spTotemAuthUsuarioSel')
    DROP PROCEDURE [dbo].[spTotemAuthUsuarioSel]
GO

CREATE PROCEDURE [dbo].[spTotemAuthUsuarioSel]
    @NombreUsuario VARCHAR(50),
    @Contrasena VARCHAR(100)
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
    WHERE NombreUsuario = @NombreUsuario
      AND Contrasena = @Contrasena
      AND Habilitado = 1
      AND Sistema = 45
END
GO
