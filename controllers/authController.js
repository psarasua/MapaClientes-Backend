import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import pool from '../config/db.js';

export const login = async (req, res, next) => {
  try {
    const { usuario, contrasenia } = req.body;
    if (!usuario || !contrasenia) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }
    // Buscar usuario en la base de datos
    const result = await pool.query('SELECT * FROM usuarios WHERE usuario = $1', [usuario]);
    if (result.rows.length === 0) {
      const err = new Error('Usuario o contraseña incorrectos');
      err.status = 401;
      return next(err);
    }
    const user = result.rows[0];
    const passwordIsValid = bcrypt.compareSync(contrasenia, user.contrasenia);
    if (!passwordIsValid) {
      const err = new Error('Usuario o contraseña incorrectos');
      err.status = 401;
      return next(err);
    }
    const token = jwt.sign({ id: user.id, usuario: user.usuario }, process.env.JWT_SECRET || 'secreto', {
      expiresIn: 86400 // 24 horas
    });
    res.json({ token });
  } catch (error) {
    next(error);
  }
};

export const signup = async (req, res, next) => {
  try {
    const { usuario, contrasenia, email } = req.body;
    if (!usuario || !contrasenia || !email) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }
    // Verificar si el usuario o email ya existen
    const existe = await pool.query('SELECT 1 FROM usuarios WHERE usuario = $1 OR email = $2', [usuario, email]);
    if (existe.rows.length > 0) {
      return res.status(409).json({ error: 'Usuario o email ya registrado' });
    }
    // Hashear la contraseña
    const hash = bcrypt.hashSync(contrasenia, 8);
    await pool.query('INSERT INTO usuarios (usuario, contrasenia, email) VALUES ($1, $2, $3)', [usuario, hash, email]);
    res.status(201).json({ message: 'Usuario registrado correctamente' });
  } catch (error) {
    next(error);
  }
};
