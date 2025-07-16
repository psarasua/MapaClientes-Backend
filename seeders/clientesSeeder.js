// seeders/clientesSeeder.js
import prisma from "../lib/prisma.js";

export async function seedClientes() {
  console.log("👥 Creando clientes de ejemplo...");

  const clientes = [
    {
      nombre: "Empresa ABC",
      razon: "ABC S.A.",
      direccion: "Av. Principal 123",
      telefono: "+56912345678",
      rut: "12345678-9",
      activo: true,
      x: "-33.4489",
      y: "-70.6693",
    },
    {
      nombre: "Comercial XYZ",
      razon: "XYZ Ltda.",
      direccion: "Calle Secundaria 456",
      telefono: "+56987654321",
      rut: "87654321-K",
      activo: true,
      x: "-33.4569",
      y: "-70.6483",
    },
  ];

  const promises = clientes.map(async (cliente) => {
    try {
      await prisma.clientes.create({
        data: cliente,
      });
    } catch {
      console.log(`⚠️  Cliente ${cliente.nombre} ya existe, continuando...`);
    }
  });

  await Promise.all(promises);

  console.log("✅ Clientes creados exitosamente");
}
