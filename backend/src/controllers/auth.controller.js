const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const emailService = require('../services/email.service');

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_development';

exports.register = async (req, res) => {
  try {
    const { razonSocial, nombre, email, password, role, correoAsesor } = req.body;

    // Validación básica adicional (la principal puede ir en express-validator)
    if (!email || !password || !role) {
      return res.status(400).json({ error: 'Faltan campos obligatorios.' });
    }

    // Verificar si el correo ya existe
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Este correo electrónico ya está registrado.' });
    }

    // Hashear contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Crear usuario
    const user = await prisma.user.create({
      data: {
        razonSocial,
        nombre,
        email,
        correoAsesor,
        password: hashedPassword,
        role
      }
    });

    res.status(201).json({
      message: 'Usuario registrado exitosamente.',
      user: { id: user.id, email: user.email, role: user.role }
    });
  } catch (error) {
    console.error('Error en register:', error);
    res.status(500).json({ error: 'Error interno del servidor al registrar usuario.' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Por favor ingrese correo y contraseña.' });
    }

    // Buscar usuario
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas.' });
    }

    // Verificar contraseña
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Credenciales inválidas.' });
    }

    // Generar JWt
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.status(200).json({
      message: 'Inicio de sesión exitoso.',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        nombre: user.nombre,
        razonSocial: user.razonSocial
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error interno del servidor al iniciar sesión.' });
  }
};

exports.requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    
    // En un sistema real aquí se genera un token, se guarda en DB temporalmente y se envía por correo
    // Por simplicidad para este demo, simularemos el envío y generaremos un token JWT temporal
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Para no revelar qué correos existen, devolvems éxito de todas formas
      return res.status(200).json({ message: 'Si el correo existe, se han enviado las instrucciones.' });
    }

    const resetToken = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '15m' });
    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/reset-password?token=${resetToken}`;
    
    // Envio Real por correo
    await emailService.sendPasswordResetEmail(user.email, resetLink);

    res.status(200).json({ message: 'Si el correo existe, se han enviado las instrucciones.', simulatedToken: null });
  } catch (error) {
    console.error('Error en requestPasswordReset:', error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token y nueva contraseña son obligatorios.' });
    }

    // Verificar token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Hashear nueva contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Actualizar usuario
    await prisma.user.update({
      where: { id: decoded.id },
      data: { password: hashedPassword }
    });

    res.status(200).json({ message: 'Contraseña actualizada exitosamente.' });
  } catch (error) {
    console.error('Error en resetPassword:', error);
    // Si jwt.verify falla lanzará error aquí
    res.status(400).json({ error: 'Token inválido o expirado.' });
  }
};
