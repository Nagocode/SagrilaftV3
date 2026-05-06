const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const emailService = require('../services/email.service');

const prisma = new PrismaClient();

exports.getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: {
        role: {
          not: 'Admin'
        }
      },
      include: {
        documents: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    res.status(200).json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Error al obtener la lista de usuarios.' });
  }
};

exports.updateDocumentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejectReason } = req.body;

    if (!['aprobado', 'rechazado'].includes(status)) {
      return res.status(400).json({ error: 'Estado inválido.' });
    }

    const document = await prisma.document.findUnique({
      where: { id },
      include: { user: true }
    });

    if (!document) {
      return res.status(404).json({ error: 'Documento no encontrado.' });
    }

    if (status === 'rechazado') {
      // 1. Send failure reason email
      await emailService.sendDocumentRejectedEmail(document.user, document, rejectReason);

      // 2. Erase the physical file
      const finalDir = path.join(__dirname, '../../uploads', document.user.role.toLowerCase(), document.user.email);
      const filePath = path.join(finalDir, document.filename);
      
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      // 3. Update database status and size to 0 since file doesn't exist
      await prisma.document.update({
        where: { id },
        data: { status, size: 0 }
      });
      
    } else if (status === 'aprobado') {
      await prisma.document.update({
        where: { id },
        data: { status }
      });
    }

    res.status(200).json({ message: 'Estado del documento actualizado exitosamente.' });
  } catch (error) {
    console.error('Error updating document status:', error);
    res.status(500).json({ error: 'Error al actualizar el estado del documento.' });
  }
};

const getLatestLogFile = () => {
  const logDir = path.join(__dirname, '../../logs');
  if (!fs.existsSync(logDir)) return null;
  const files = fs.readdirSync(logDir).filter(f => f.endsWith('.log'));
  if (files.length === 0) return null;
  files.sort().reverse();
  return path.join(logDir, files[0]);
};

exports.getLogs = (req, res) => {
  try {
    const latestLog = getLatestLogFile();
    if (!latestLog) {
      return res.status(200).json({ logs: 'No hay registros disponibles todavía.' });
    }
    
    // Read the last 5MB of logs or whole file if smaller to prevent memory issues
    const stats = fs.statSync(latestLog);
    const readSize = Math.min(stats.size, 5 * 1024 * 1024);
    const startPosition = stats.size - readSize;
    
    const stream = fs.createReadStream(latestLog, { start: startPosition, encoding: 'utf8' });
    let data = '';
    
    stream.on('data', chunk => data += chunk);
    stream.on('end', () => {
      // Return last 1000 lines
      const lines = data.split('\n');
      const tail = lines.slice(-1000).join('\n');
      res.status(200).json({ logs: tail, file: path.basename(latestLog) });
    });
    stream.on('error', err => {
      res.status(500).json({ error: 'Error leyendo los logs.' });
    });
  } catch (error) {
    res.status(500).json({ error: 'Error accediendo a los logs.' });
  }
};

exports.downloadLogs = (req, res) => {
  try {
    const latestLog = getLatestLogFile();
    if (!latestLog) {
      return res.status(404).json({ error: 'Archivo de log no encontrado.' });
    }
    res.download(latestLog);
  } catch (error) {
    res.status(500).json({ error: 'Error al descargar logs.' });
  }
};

exports.createAdmin = async (req, res) => {
  try {
    if (req.userEmail !== 'areasistemas@hierroshb.com') {
      return res.status(403).json({ error: 'No tienes permiso para crear administradores.' });
    }

    const { nombre, email, password } = req.body;

    if (!nombre || !email || !password) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    // Verificar si el correo ya existe
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Este correo electrónico ya está registrado.' });
    }

    // Hashear contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Crear usuario admin
    const user = await prisma.user.create({
      data: {
        nombre,
        email,
        password: hashedPassword,
        role: 'Admin'
      }
    });

    res.status(201).json({
      message: 'Administrador creado exitosamente.',
      user: { id: user.id, email: user.email, nombre: user.nombre, role: user.role }
    });
  } catch (error) {
    console.error('Error creando administrador:', error);
    res.status(500).json({ error: 'Error interno del servidor al crear administrador.' });
  }
};

exports.getAdminsList = async (req, res) => {
  try {
    if (req.userEmail !== 'areasistemas@hierroshb.com') {
      return res.status(403).json({ error: 'No tienes permiso para ver esta lista.' });
    }

    const admins = await prisma.user.findMany({
      where: {
        role: 'Admin'
      },
      select: {
        id: true,
        nombre: true,
        email: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    res.status(200).json({ admins });
  } catch (error) {
    console.error('Error fetching admins:', error);
    res.status(500).json({ error: 'Error al obtener la lista de administradores.' });
  }
};

exports.deleteAdmin = async (req, res) => {
  try {
    if (req.userEmail !== 'areasistemas@hierroshb.com') {
      return res.status(403).json({ error: 'No tienes permiso para eliminar administradores.' });
    }

    const { id } = req.params;

    const adminToDelete = await prisma.user.findUnique({ where: { id } });
    
    if (!adminToDelete) {
      return res.status(404).json({ error: 'Administrador no encontrado.' });
    }

    // Prevents self deletion
    if (adminToDelete.email === 'areasistemas@hierroshb.com') {
      return res.status(400).json({ error: 'No puedes eliminar la cuenta principal del sistema.' });
    }

    if (adminToDelete.role !== 'Admin') {
      return res.status(400).json({ error: 'El usuario especificado no es un administrador.' });
    }

    await prisma.user.delete({ where: { id } });

    res.status(200).json({ message: 'Administrador eliminado exitosamente.' });
  } catch (error) {
    console.error('Error deleting admin:', error);
    res.status(500).json({ error: 'Error interno al intentar eliminar el administrador.' });
  }
};
