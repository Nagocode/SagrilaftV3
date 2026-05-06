const nodemailer = require('nodemailer');
const path = require('path');

const logoPath = path.join(__dirname, '../assets/LogoPrincipal.png');
const logoAttachment = {
  filename: 'LogoPrincipal.png',
  path: logoPath,
  cid: 'logoPrincipal'
};

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.office365.com',
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: false, // Para puerto 587 siempre debe ser false
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  },
  tls: {
    // Necesario para algunos servidores de Office 365 y Gmail con STARTTLS
    ciphers: 'SSLv3',
    rejectUnauthorized: false
  }
});

// Verificar conexión al inicio
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Error en la configuración de correo:', error);
  } else {
    console.log('✅ Servidor de correo listo para enviar mensajes');
  }
});

exports.sendUserRegistrationNotification = async (user) => {
  try {
    const mailOptions = {
      from: `"Hierros HB - SAGRILAFT" <${process.env.SMTP_USER || 'no-reply@sistema.com'}>`,
      to: process.env.ADMIN_EMAIL || 'admin@sistema.com',
      subject: `NuevoUsuario-${user.role}-${user.razonSocial || user.nombre}`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Nuevo registro en el sistema SAGRILAFT</title>
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7f6; margin: 0; padding: 0;">
  <div style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #e5e7eb;">
    <div style="background-color: #ffffff; padding: 25px; text-align: center; border-bottom: 4px solid #dc2626;">
      <img src="cid:logoPrincipal" alt="Hierros HB" style="max-width: 220px; height: auto; display: block; margin: 0 auto;">
      <p style="margin: 15px 0 0 0; font-size: 18px; font-weight: bold; color: #374151; letter-spacing: 4px;">SAGRILAFT</p>
    </div>
    <div style="padding: 40px 30px; color: #374151;">
      <h2 style="color: #111827; margin-top: 0; font-size: 24px; text-align: center;">Nuevo registro en el sistema</h2>
      <p style="font-size: 16px; line-height: 1.6;">Se ha registrado un nuevo usuario en la plataforma SAGRILAFT. A continuación, los detalles:</p>
      <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 20px; margin: 25px 0;">
        <p style="margin: 0 0 10px 0; font-size: 15px;"><strong>Razón Social:</strong> ${user.razonSocial || 'N/A'}</p>
        <p style="margin: 0 0 10px 0; font-size: 15px;"><strong>Nombre:</strong> ${user.nombre || 'N/A'}</p>
        <p style="margin: 0 0 10px 0; font-size: 15px;"><strong>Correo electrónico:</strong> ${user.email}</p>
        <p style="margin: 0 0 10px 0; font-size: 15px;"><strong>Rol:</strong> <span style="background-color: #e5e7eb; padding: 2px 8px; border-radius: 12px; font-size: 13px; color: #374151;">${user.role}</span></p>
        <p style="margin: 0; font-size: 15px;"><strong>Fecha de registro:</strong> ${new Date(user.createdAt).toLocaleString()}</p>
      </div>
      <div style="text-align: center; margin-top: 30px;">
        <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard" style="display: inline-block; padding: 12px 24px; background-color: #1f2937; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 15px;">Ir a la plataforma</a>
      </div>
    </div>
    <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
      <p style="font-size: 13px; color: #6b7280; margin: 0;">&copy; ${new Date().getFullYear()} Hierros HB. Todos los derechos reservados.</p>
    </div>
  </div>
</body>
</html>
      `,
      attachments: [logoAttachment]
    };

    await transporter.sendMail(mailOptions);
    console.log(`Notificación de registro enviada para ${user.email}`);
  } catch (error) {
    console.error('Error al enviar correo de registro:', error);
  }
};

exports.sendDocumentUploadNotification = async (user, documents, creditInfo = null) => {
  try {
    const attachments = documents.map(doc => ({
      filename: doc.filename,
      path: doc.path
    }));

    const subjectPrefix = creditInfo ? 'SolicitudCredito' : 'DocumentosCargados';

    const mailOptions = {
      from: `"Hierros HB - SAGRILAFT" <${process.env.SMTP_USER || 'no-reply@sistema.com'}>`,
      to: process.env.ADMIN_EMAIL || 'admin@sistema.com',
      subject: `${subjectPrefix}-${user.role}-${user.razonSocial || user.nombre}`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Nuevos Documentos Cargados</title>
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7f6; margin: 0; padding: 0;">
  <div style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #e5e7eb;">
    <div style="background-color: #ffffff; padding: 25px; text-align: center; border-bottom: 4px solid #dc2626;">
      <img src="cid:logoPrincipal" alt="Hierros HB" style="max-width: 220px; height: auto; display: block; margin: 0 auto;">
      <p style="margin: 15px 0 0 0; font-size: 18px; font-weight: bold; color: #374151; letter-spacing: 4px;">SAGRILAFT</p>
    </div>
    <div style="padding: 40px 30px; color: #374151;">
      <h2 style="color: #111827; margin-top: 0; font-size: 24px; text-align: center;">${creditInfo ? 'Nueva Solicitud de Crédito' : 'Nuevos Documentos Cargados'}</h2>
      <p style="font-size: 16px; line-height: 1.6;">El usuario <strong>${user.razonSocial || user.nombre}</strong> (${user.role}) ha subido archivos para su revisión.</p>
      
      ${creditInfo ? `
      <div style="background-color: #fdf2f2; border: 1px solid #fecaca; border-radius: 6px; padding: 20px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #b91c1c; font-size: 16px;">Detalles de la Solicitud de Crédito</h3>
        <p style="margin: 10px 0; font-size: 14px;"><strong>Tipo de Solicitud:</strong> ${creditInfo.type}</p>
        <div style="background: white; padding: 15px; border-radius: 4px; border: 1px solid #fee2e2; margin-top: 10px;">
          <p style="margin: 0 0 10px 0; font-weight: bold; font-size: 14px; color: #7f1d1d;">Condiciones Solicitadas</p>
          <p style="margin: 5px 0; font-size: 13px;"><strong>Cupo solicitado:</strong> ${creditInfo.requestedCupo || 'N/A'}</p>
          <p style="margin: 5px 0; font-size: 13px;"><strong>Condición de pago:</strong> ${creditInfo.requestedCondicion || 'N/A'}</p>
        </div>
      </div>
      ` : ''}

      <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 20px; margin: 25px 0;">
        <h3 style="margin-top: 0; color: #374151; font-size: 16px;">Archivos Adjuntos:</h3>
        <ul style="margin: 0; padding-left: 20px; font-size: 15px; color: #4b5563;">
          ${documents.map(d => `<li style="margin-bottom: 8px;"><strong>${d.type}:</strong> ${d.filename}</li>`).join('')}
        </ul>
      </div>

      <div style="text-align: center; margin-top: 30px;">
        <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/admin/dashboard" style="display: inline-block; padding: 12px 24px; background-color: #1f2937; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 15px;">Ir al Panel de Administración</a>
      </div>
    </div>
    <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
      <p style="font-size: 13px; color: #6b7280; margin: 0;">&copy; ${new Date().getFullYear()} Hierros HB. Todos los derechos reservados.</p>
    </div>
  </div>
</body>
</html>
      `,
      attachments: [...attachments, logoAttachment]
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Notificación de carga enviada: ${info.messageId} para ${user.email}`);
  } catch (error) {
    console.error('❌ Error al enviar correo de documentos:', error);
  }
};

exports.sendPasswordResetEmail = async (email, resetLink) => {
  try {
    const mailOptions = {
      from: `"Hierros HB SAGRILAFT" <${process.env.SMTP_USER || 'no-reply@sistema.com'}>`,
      to: email,
      subject: `Restablecer Contraseña - Hierros HB`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Restablecer Contraseña</title>
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7f6; margin: 0; padding: 0;">
  <div style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #e5e7eb;">
    <div style="background-color: #ffffff; padding: 25px; text-align: center; border-bottom: 4px solid #dc2626;">
      <img src="cid:logoPrincipal" alt="Hierros HB" style="max-width: 220px; height: auto; display: block; margin: 0 auto;">
      <p style="margin: 15px 0 0 0; font-size: 18px; font-weight: bold; color: #374151; letter-spacing: 4px;">SAGRILAFT</p>
    </div>
    <div style="padding: 40px 30px; color: #374151;">
      <h2 style="color: #111827; margin-top: 0; font-size: 24px; text-align: center;">Restablecer contraseña</h2>
      <p style="font-size: 16px; line-height: 1.6; text-align: center;">Has solicitado restablecer tu contraseña en la plataforma. Haz clic en el siguiente botón para crear una nueva:</p>
      
      <div style="text-align: center; margin: 35px 0;">
        <a href="${resetLink}" target="_blank" style="display: inline-block; padding: 14px 30px; background-color: #dc2626; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; transition: background-color 0.3s;">Restablecer mi Contraseña</a>
      </div>
      
      <p style="font-size: 14px; color: #6b7280; text-align: center; background-color: #f3f4f6; padding: 15px; border-radius: 6px; word-break: break-all;">
        Si el botón no funciona, copia y pega este enlace en tu navegador:<br><br>
        <a href="${resetLink}" style="color: #2563eb;">${resetLink}</a>
      </p>
    </div>
    <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
      <p style="font-size: 13px; color: #6b7280; margin: 0;">Este enlace expirará en 15 minutos.</p>
      <p style="font-size: 13px; color: #6b7280; margin: 5px 0 0 0;">Si no fuiste tú quien solicitó esto, por favor ignora y elimina este correo.</p>
      <p style="font-size: 13px; color: #6b7280; margin: 15px 0 0 0;">&copy; ${new Date().getFullYear()} Hierros HB. Todos los derechos reservados.</p>
    </div>
  </div>
</body>
</html>
      `,
      attachments: [logoAttachment]
    };

    await transporter.sendMail(mailOptions);
    console.log(`Correo de restablecimiento de contraseña enviado a ${email}`);
  } catch (error) {
    console.error('Error al enviar correo de restablecimiento:', error);
  }
};

exports.sendDocumentRejectedEmail = async (user, document, rejectReason) => {
  try {
    const recipients = user.correoAsesor ? `${user.email}, ${user.correoAsesor}` : user.email;

    const mailOptions = {
      from: `"Hierros HB SAGRILAFT" <${process.env.SMTP_USER || 'no-reply@sistema.com'}>`,
      to: recipients,
      subject: `Documento Rechazado - ${document.type}`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Documento Rechazado</title>
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7f6; margin: 0; padding: 0;">
  <div style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #e5e7eb;">
    
    <div style="background-color: #ffffff; padding: 25px; text-align: center; border-bottom: 4px solid #dc2626;">
      <img src="cid:logoPrincipal" alt="Hierros HB" style="max-width: 220px; height: auto; display: block; margin: 0 auto;">
      <p style="margin: 15px 0 0 0; font-size: 18px; font-weight: bold; color: #374151; letter-spacing: 4px;">SAGRILAFT</p>
    </div>

    <div style="padding: 40px 30px; color: #374151;">
      <h2 style="color: #111827; margin-top: 0; font-size: 24px; text-align: center;">Documento Rechazado</h2>
      
      <p style="font-size: 16px; line-height: 1.6;">Hola <strong>${user.nombre || user.razonSocial}</strong>,</p>
      
      <p style="font-size: 16px; line-height: 1.6;">Te informamos que tu documento <strong>${document.type}</strong> no ha superado nuestra revisión. Por favor, lee atentamente el motivo y vuelve a cargarlo a través de la plataforma.</p>
      
      <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; border-radius: 4px; padding: 20px; margin: 25px 0;">
        <p style="margin: 0 0 12px 0; font-size: 15px;"><strong>Archivo original:</strong> <span style="color: #4b5563;">${document.originalName}</span></p>
        <p style="margin: 0; font-size: 15px;"><strong>Motivo de rechazo:</strong></p>
        <p style="margin: 8px 0 0 0; color: #991b1b; font-weight: 500; font-size: 15px; padding: 10px; background-color: #fee2e2; border-radius: 4px;">${rejectReason}</p>
      </div>
      
      <p style="font-size: 16px; line-height: 1.6; text-align: center; margin-bottom: 30px;">Puedes ingresar al sistema para cargar un nuevo archivo correspondiente a este requisito.</p>
      
      <div style="text-align: center;">
        <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard" style="display: inline-block; padding: 14px 30px; background-color: #dc2626; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; transition: background-color 0.3s;">Ir a mi Panel</a>
      </div>
    </div>
    
    <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
      <p style="font-size: 13px; color: #6b7280; margin: 0;">&copy; ${new Date().getFullYear()} Hierros HB. Todos los derechos reservados.</p>
      <p style="font-size: 13px; color: #6b7280; margin: 5px 0 0 0;">Este es un mensaje automático, por favor no respondas a este correo.</p>
    </div>
  </div>
</body>
</html>
      `,
      attachments: [logoAttachment]
    };

    await transporter.sendMail(mailOptions);
    console.log(`Correo de documento rechazado enviado a ${user.email}`);
  } catch (error) {
    console.error('Error al enviar correo de documento rechazado:', error);
  }
};
