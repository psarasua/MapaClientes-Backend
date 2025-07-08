-- Tabla de relación camiones-días (asignación de camiones a días de entrega)
CREATE TABLE IF NOT EXISTS camiones_dias (
    id SERIAL PRIMARY KEY,
    camion_id INTEGER NOT NULL REFERENCES camiones(id) ON DELETE CASCADE,
    dia_entrega_id INTEGER NOT NULL REFERENCES dias_entrega(id) ON DELETE CASCADE
);
