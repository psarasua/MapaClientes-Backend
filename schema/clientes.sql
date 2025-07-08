-- Tabla de clientes
CREATE TABLE IF NOT EXISTS clientes (
    id SERIAL PRIMARY KEY,
    codigo_alternativo VARCHAR(50),
    nombre VARCHAR(100) NOT NULL,
    razon VARCHAR(100),
    direccion VARCHAR(200),
    telefono VARCHAR(30),
    rut VARCHAR(30),
    activo BOOLEAN DEFAULT TRUE,
    x DOUBLE PRECISION,
    y DOUBLE PRECISION
);
