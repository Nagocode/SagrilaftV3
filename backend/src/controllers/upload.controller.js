const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const emailService = require('../services/email.service');

const prisma = new PrismaClient();

const formatFileName = (name) => {
  return name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
};

exports.uploadDocuments = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ error: 'No se subió ningún archivo.' });
    }

    const { email, role, nombre, razonSocial } = user;
    const baseName = formatFileName(razonSocial || nombre || 'Usuario');
    
    // Crear el directorio final: /uploads/{rol}/{email}/
    const finalDir = path.join(__dirname, '../../uploads', role.toLowerCase(), email);
    if (!fs.existsSync(finalDir)) {
      fs.mkdirSync(finalDir, { recursive: true });
    }

    const savedDocuments = [];
    const mailAttachments = [];

    // Iterar sobre los archivos subidos
    for (const fieldName in req.files) {
      const fileArray = req.files[fieldName];
      for (const file of fileArray) {
        
        let fileType = 'Otro';
        let metadata = null;

        if (fieldName === 'cedula') fileType = 'Cedula';
        else if (fieldName === 'camaraComercio') fileType = 'CamaraComercio';
        else if (fieldName === 'formulario') fileType = 'Formulario';
        else if (fieldName === 'rut') fileType = 'Rut';
        else if (fieldName === 'certificacionBancaria') fileType = 'CertificacionBancaria';
        else if (fieldName === 'balanceGeneral') fileType = 'BalanceGeneral';
        else if (fieldName === 'estadoResultados') fileType = 'EstadoResultados';
        else if (fieldName === 'estadoFlujoEfectivo') fileType = 'EstadoFlujoEfectivo';
        else if (fieldName === 'notasEstadosFinancieros') fileType = 'NotasEstadosFinancieros';
        else if (fieldName === 'referenciaComercial1') fileType = 'ReferenciaComercial1';
        else if (fieldName === 'referenciaComercial2') fileType = 'ReferenciaComercial2';
        else if (fieldName === 'declaracionRenta') fileType = 'DeclaracionRenta';

        const isCreditDoc = [
          'BalanceGeneral', 'EstadoResultados', 'EstadoFlujoEfectivo', 
          'NotasEstadosFinancieros', 'ReferenciaComercial1', 
          'ReferenciaComercial2', 'DeclaracionRenta'
        ].includes(fileType);

        if (isCreditDoc && req.body.creditRequestType) {
          metadata = JSON.stringify({ 
            cupo: req.body.requestedCupo, 
            condicion: req.body.requestedCondicion,
            requestType: req.body.creditRequestType
          });
        }

        const ext = path.extname(file.originalname);
        const finalFileName = `${baseName}_${role}_${fileType}${ext}`;
        const finalPath = path.join(finalDir, finalFileName);

        // Mover archivo desde temp a path final
        fs.renameSync(file.path, finalPath);

        // Actualizar/Crear Documento en DB
        let document = await prisma.document.findFirst({
          where: { userId: user.id, type: fileType }
        });

        if (document) {
          document = await prisma.document.update({
            where: { id: document.id },
            data: {
               filename: finalFileName,
               originalName: file.originalname,
               mimeType: file.mimetype,
               size: file.size,
               status: 'cargado',
               metadata: metadata,
               uploadedAt: new Date()
            }
          });
        } else {
          document = await prisma.document.create({
            data: {
              type: fileType,
              filename: finalFileName,
              originalName: file.originalname,
              mimeType: file.mimetype,
              size: file.size,
              userId: user.id,
              metadata: metadata,
              status: 'cargado'
            }
          });
        }

        savedDocuments.push(document);
        mailAttachments.push({ type: fileType, filename: finalFileName, path: finalPath });
      }
    }

    // Configurar correo para enviar archivos
    const creditInfo = req.body.creditRequestType ? {
      type: req.body.creditRequestType,
      requestedCupo: req.body.requestedCupo,
      requestedCondicion: req.body.requestedCondicion
    } : null;

    // Enviar notificación asincronamente
    emailService.sendDocumentUploadNotification(user, mailAttachments, creditInfo);

    res.status(200).json({ 
      message: 'Documentos subidos y procesados correctamente.',
      documents: savedDocuments 
    });

  } catch (error) {
    console.error('Error procesando documentos:', error);
    res.status(500).json({ error: 'Ocurrió un error al subir los documentos.' });
  }
};

exports.getUserDocuments = async (req, res) => {
  try {
    const documents = await prisma.document.findMany({
      where: { userId: req.userId }
    });
    res.status(200).json({ documents });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener documentos.' });
  }
};

// Endpoint para descargar formulario base
exports.downloadBaseForm = (req, res) => {
  const filePath = path.join(__dirname, '../../templates/formulario_base.xls');
  if (fs.existsSync(filePath)) {
    res.download(filePath, 'formulario_base_sagrilaft.xls');
  } else {
    res.status(404).json({ error: 'El archivo de formulario no ha sido configurado en el servidor.' });
  }
};
