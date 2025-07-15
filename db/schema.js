import { pgTable, serial, text, boolean, timestamp, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Tabla de días de entrega
export const diasEntrega = pgTable('dias_entrega', {
  id: serial('id').primaryKey(),
  descripcion: text('descripcion').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Tabla de camiones
export const camiones = pgTable('camiones', {
  id: serial('id').primaryKey(),
  descripcion: text('descripcion').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Tabla de clientes
export const clientes = pgTable('clientes', {
  id: serial('id').primaryKey(),
  codigoAlternativo: text('codigo_alternativo'),
  nombre: text('nombre').notNull(),
  razon: text('razon'),
  direccion: text('direccion'),
  telefono: text('telefono'),
  rut: text('rut'),
  activo: boolean('activo').default(true),
  x: text('x'),
  y: text('y'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Tabla de relación camiones-días
export const camionesDias = pgTable('camiones_dias', {
  id: serial('id').primaryKey(),
  camionId: integer('camion_id').references(() => camiones.id),
  diaEntregaId: integer('dia_entrega_id').references(() => diasEntrega.id),
  createdAt: timestamp('created_at').defaultNow(),
});

// Relaciones
export const camionesRelations = relations(camiones, ({ many }) => ({
  camionesDias: many(camionesDias),
}));

export const diasEntregaRelations = relations(diasEntrega, ({ many }) => ({
  camionesDias: many(camionesDias),
}));

export const camionesDiasRelations = relations(camionesDias, ({ one }) => ({
  camion: one(camiones, {
    fields: [camionesDias.camionId],
    references: [camiones.id],
  }),
  diaEntrega: one(diasEntrega, {
    fields: [camionesDias.diaEntregaId],
    references: [diasEntrega.id],
  }),
}));
