-- exec spTotemInsertarPaciente 210, 508, '47203123', 'Prueba Prueba'
create PROCEDURE [dbo].[spTotemInsertarPaciente]
    @Cliente INT,
    @SucursalId INT,
    @Dni VARCHAR(10),
	@Nombre varchar(1000) = NULL
	

AS
BEGIN
     
	exec BDTurnero..spPacienteIns 1, 7, @Nombre, '', 1, @Dni, null, null,
		'M', null,null,null,null,null,null,null, @Cliente, 1 

    
END
GO
