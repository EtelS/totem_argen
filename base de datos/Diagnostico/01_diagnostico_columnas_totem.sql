-- ============================================================
-- Diagnóstico: columnas usadas por los SPs del totem
-- Objetivo: confirmar nombres y tipos antes de impactar
--           spTotemAtencionPorDniSel y spTotemSucursalesSel.
--   - BDTurnero..Paciente: Nombre / Apellido (asumidos, no confirmados).
--   - BDTurnero..Turno: tipo de Fecha y Hora (el SP formatea Hora a 'HH:mm').
--   - BdCentral..Sucursal: ClienteId y si existe un flag de habilitada.
-- ============================================================

-- BLOQUE 1 - Columnas de BDTurnero
SELECT 'BDTurnero' AS Base, t.name AS Tabla, c.name AS Columna,
       ty.name AS Tipo, c.max_length AS Largo, c.is_nullable AS EsNullable,
       c.collation_name AS Collation
FROM BDTurnero.sys.columns c
INNER JOIN BDTurnero.sys.tables t ON t.object_id = c.object_id
INNER JOIN BDTurnero.sys.types ty ON ty.user_type_id = c.user_type_id
WHERE (t.name = 'Paciente' AND c.name IN ('Codigo', 'Cliente', 'DocumentoNro', 'Nombre', 'Apellido', 'MutualId'))
   OR (t.name = 'Turno' AND c.name IN ('Codigo', 'Paciente', 'Fecha', 'Hora', 'Prestador', 'Mutual', 'SucursalId', 'Estado'))
   OR (t.name = 'Prestador' AND c.name IN ('Codigo', 'Nombre', 'Apellido'))
   OR (t.name = 'Mutual' AND c.name IN ('Codigo', 'Nombre'))
ORDER BY Tabla, Columna;

-- BLOQUE 2 - Todas las columnas de BdCentral..Sucursal y BdCentral..Usuario
SELECT 'BdCentral' AS Base, t.name AS Tabla, c.name AS Columna,
       ty.name AS Tipo, c.max_length AS Largo, c.is_nullable AS EsNullable
FROM BdCentral.sys.columns c
INNER JOIN BdCentral.sys.tables t ON t.object_id = c.object_id
INNER JOIN BdCentral.sys.types ty ON ty.user_type_id = c.user_type_id
WHERE t.name IN ('Sucursal', 'Usuario')
ORDER BY Tabla, c.column_id;

-- BLOQUE 3 - Muestra de nombres de mutual (para validar cómo se llama "particular")
SELECT TOP 50 Codigo, Nombre
FROM BDTurnero..Mutual WITH (NOLOCK)
WHERE Nombre LIKE '%particular%'
ORDER BY Nombre;
