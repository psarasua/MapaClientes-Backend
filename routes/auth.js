const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const authController = require('../controllers/authController');

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login de usuario
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: admin
 *               password:
 *                 type: string
 *                 example: admin123
 *     responses:
 *       200:
 *         description: Token JWT generado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: Usuario o contraseña incorrectos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: integer
 *                       example: 401
 *                     message:
 *                       type: string
 *                       example: Usuario o contraseña incorrectos
 *                     details:
 *                       type: string
 *                       nullable: true
 */

/**
 * @swagger
 * /auth/signup:
 *   post:
 *     summary: Registro de usuario
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - usuario
 *               - contrasenia
 *               - email
 *             properties:
 *               usuario:
 *                 type: string
 *                 example: usuario1
 *               contrasenia:
 *                 type: string
 *                 example: password123
 *               email:
 *                 type: string
 *                 example: usuario1@email.com
 *     responses:
 *       201:
 *         description: Usuario registrado correctamente
 *       400:
 *         description: Faltan campos requeridos
 *       409:
 *         description: Usuario o email ya registrado
 */

// Validación de datos para login
router.post(
  '/login',
  [
    body('username').notEmpty().withMessage('El usuario es requerido'),
    body('password').notEmpty().withMessage('La contraseña es requerida')
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  authController.login
);

// Validación de datos para signup
router.post(
  '/signup',
  [
    body('usuario').notEmpty().withMessage('El usuario es requerido'),
    body('contrasenia').notEmpty().withMessage('La contraseña es requerida'),
    body('email').isEmail().withMessage('Email inválido')
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  authController.signup
);

module.exports = router;
