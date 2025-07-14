// utils/validation.js
export const validateCliente = (cliente) => {
  const errors = [];

  if (!cliente.nombre || cliente.nombre.trim().length === 0) {
    errors.push('El nombre es requerido');
  }

  if (cliente.nombre && cliente.nombre.length > 100) {
    errors.push('El nombre no puede exceder 100 caracteres');
  }

  if (cliente.razon && cliente.razon.length > 100) {
    errors.push('La razón social no puede exceder 100 caracteres');
  }

  if (cliente.direccion && cliente.direccion.length > 200) {
    errors.push('La dirección no puede exceder 200 caracteres');
  }

  if (cliente.telefono && cliente.telefono.length > 30) {
    errors.push('El teléfono no puede exceder 30 caracteres');
  }

  if (cliente.rut && cliente.rut.length > 30) {
    errors.push('El RUT no puede exceder 30 caracteres');
  }

  if (cliente.x && (isNaN(cliente.x) || cliente.x < -180 || cliente.x > 180)) {
    errors.push('La coordenada X debe ser un número válido entre -180 y 180');
  }

  if (cliente.y && (isNaN(cliente.y) || cliente.y < -90 || cliente.y > 90)) {
    errors.push('La coordenada Y debe ser un número válido entre -90 y 90');
  }

  return errors;
};

export const validateClienteUpdate = (cliente) => {
  const errors = [];

  if (cliente.nombre !== undefined && (!cliente.nombre || cliente.nombre.trim().length === 0)) {
    errors.push('El nombre no puede estar vacío');
  }

  // Reutilizar las validaciones del create pero solo para campos presentes
  const fieldsToValidate = {};
  Object.keys(cliente).forEach(key => {
    if (cliente[key] !== undefined) {
      fieldsToValidate[key] = cliente[key];
    }
  });

  const createErrors = validateCliente(fieldsToValidate);
  return errors.concat(createErrors.filter(error => !error.includes('requerido')));
};
