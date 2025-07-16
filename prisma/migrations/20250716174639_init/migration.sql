-- CreateTable
CREATE TABLE "dias_entrega" (
    "id" SERIAL NOT NULL,
    "descripcion" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dias_entrega_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "camiones" (
    "id" SERIAL NOT NULL,
    "descripcion" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "camiones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clientes" (
    "id" SERIAL NOT NULL,
    "codigo_alternativo" TEXT,
    "nombre" TEXT NOT NULL,
    "razon" TEXT,
    "direccion" TEXT,
    "telefono" TEXT,
    "rut" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "x" TEXT,
    "y" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "clientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "camiones_dias" (
    "id" SERIAL NOT NULL,
    "camion_id" INTEGER NOT NULL,
    "dia_entrega_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "camiones_dias_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "camiones_dias_camion_id_dia_entrega_id_key" ON "camiones_dias"("camion_id", "dia_entrega_id");

-- AddForeignKey
ALTER TABLE "camiones_dias" ADD CONSTRAINT "camiones_dias_camion_id_fkey" FOREIGN KEY ("camion_id") REFERENCES "camiones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "camiones_dias" ADD CONSTRAINT "camiones_dias_dia_entrega_id_fkey" FOREIGN KEY ("dia_entrega_id") REFERENCES "dias_entrega"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
