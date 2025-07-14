-- Seeder para la tabla camiones
-- Insertar datos de ejemplo en la tabla camiones

INSERT INTO camiones (descripcion) VALUES 
('Daniel Torres'),
('Alvaro Garcia'),
('Robert Labruna'),
('Jose Luis'),
('Reparto Nuevo')
ON CONFLICT DO NOTHING;

-- Verificar que los datos se insertaron correctamente
SELECT * FROM camiones;
