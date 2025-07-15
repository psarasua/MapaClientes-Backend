CREATE TABLE "camiones" (
	"id" serial PRIMARY KEY NOT NULL,
	"descripcion" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "camiones_dias" (
	"id" serial PRIMARY KEY NOT NULL,
	"camion_id" integer,
	"dia_entrega_id" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "clientes" (
	"id" serial PRIMARY KEY NOT NULL,
	"codigo_alternativo" text,
	"nombre" text NOT NULL,
	"razon" text,
	"direccion" text,
	"telefono" text,
	"rut" text,
	"activo" boolean DEFAULT true,
	"x" text,
	"y" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "dias_entrega" (
	"id" serial PRIMARY KEY NOT NULL,
	"descripcion" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "camiones_dias" ADD CONSTRAINT "camiones_dias_camion_id_camiones_id_fk" FOREIGN KEY ("camion_id") REFERENCES "public"."camiones"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "camiones_dias" ADD CONSTRAINT "camiones_dias_dia_entrega_id_dias_entrega_id_fk" FOREIGN KEY ("dia_entrega_id") REFERENCES "public"."dias_entrega"("id") ON DELETE no action ON UPDATE no action;