const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/upload.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');

// Configuración para recibir los 3 archivos usando multer fields
const uploadFields = upload.fields([
  { name: 'cedula', maxCount: 1 },
  { name: 'camaraComercio', maxCount: 1 },
  { name: 'formulario', maxCount: 1 },
  { name: 'rut', maxCount: 1 },
  { name: 'certificacionBancaria', maxCount: 1 },
  { name: 'balanceGeneral', maxCount: 1 },
  { name: 'estadoResultados', maxCount: 1 },
  { name: 'estadoFlujoEfectivo', maxCount: 1 },
  { name: 'notasEstadosFinancieros', maxCount: 1 },
  { name: 'referenciaComercial1', maxCount: 1 },
  { name: 'referenciaComercial2', maxCount: 1 },
  { name: 'declaracionRenta', maxCount: 1 }
]);

router.post('/', verifyToken, uploadFields, uploadController.uploadDocuments);
router.get('/', verifyToken, uploadController.getUserDocuments);
router.get('/download-form', uploadController.downloadBaseForm);

module.exports = router;
