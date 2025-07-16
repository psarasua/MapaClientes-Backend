// Middleware para manejar CORS y otras configuraciones
export default async function middleware(request, context) {
  // Permitir todas las solicitudes OPTIONS
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  // Continuar con la siguiente función
  return context.next();
}
