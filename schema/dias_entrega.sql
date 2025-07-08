-- Tabla de días de entrega
CREATE TABLE IF NOT EXISTS dias_entrega (
    id SERIAL PRIMARY KEY,
    descripcion VARCHAR(100) NOT NULL
);
