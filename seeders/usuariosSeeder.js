// seeders/usuariosSeeder.js
import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma.js';

export const usuariosSeeder = async () => {
  console.log('👥 Creando usuarios de ejemplo...');

  // Limpiar tabla de usuarios
  await prisma.usuarios.deleteMany();

  // Datos de usuarios de ejemplo
  const usuarios = [
    {
      email: 'admin@mapaclientes.com',
      password: await bcrypt.hash('admin123', 12),
      nombre: 'Administrador',
      apellido: 'Principal',
      rol: 'super_admin',
      activo: true,
    },
    {
      email: 'gerente@mapaclientes.com',
      password: await bcrypt.hash('gerente123', 12),
      nombre: 'María',
      apellido: 'González',
      rol: 'admin',
      activo: true,
    },
    {
      email: 'usuario1@mapaclientes.com',
      password: await bcrypt.hash('usuario123', 12),
      nombre: 'Juan',
      apellido: 'Pérez',
      rol: 'user',
      activo: true,
    },
    {
      email: 'usuario2@mapaclientes.com',
      password: await bcrypt.hash('usuario123', 12),
      nombre: 'Ana',
      apellido: 'Martínez',
      rol: 'user',
      activo: true,
    },
    {
      email: 'operador@mapaclientes.com',
      password: await bcrypt.hash('operador123', 12),
      nombre: 'Carlos',
      apellido: 'Rodríguez',
      rol: 'user',
      activo: true,
    },
    {
      email: 'supervisor@mapaclientes.com',
      password: await bcrypt.hash('supervisor123', 12),
      nombre: 'Laura',
      apellido: 'Fernández',
      rol: 'admin',
      activo: true,
    },
    {
      email: 'inactivo@mapaclientes.com',
      password: await bcrypt.hash('inactivo123', 12),
      nombre: 'Usuario',
      apellido: 'Inactivo',
      rol: 'user',
      activo: false,
    },
  ];

  // Crear usuarios
  await prisma.usuarios.createMany({
    data: usuarios,
  });

  console.log('✅ Usuarios creados exitosamente');
  
  // Mostrar información de los usuarios creados
  console.log('\n📋 Usuarios de ejemplo creados:');
  console.log('╔══════════════════════════════╤═══════════════╤══════════════╤════════════╗');
  console.log('║ Email                        │ Password      │ Rol          │ Estado     ║');
  console.log('╠══════════════════════════════╪═══════════════╪══════════════╪════════════╣');
  console.log('║ admin@mapaclientes.com       │ admin123      │ super_admin  │ Activo     ║');
  console.log('║ gerente@mapaclientes.com     │ gerente123    │ admin        │ Activo     ║');
  console.log('║ usuario1@mapaclientes.com    │ usuario123    │ user         │ Activo     ║');
  console.log('║ usuario2@mapaclientes.com    │ usuario123    │ user         │ Activo     ║');
  console.log('║ operador@mapaclientes.com    │ operador123   │ user         │ Activo     ║');
  console.log('║ supervisor@mapaclientes.com  │ supervisor123 │ admin        │ Activo     ║');
  console.log('║ inactivo@mapaclientes.com    │ inactivo123   │ user         │ Inactivo   ║');
  console.log('╚══════════════════════════════╧═══════════════╧══════════════╧════════════╝');
};

export default usuariosSeeder;
