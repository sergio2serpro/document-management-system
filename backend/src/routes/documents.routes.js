// Definição dos endpoints de documentos: delega a entrada HTTP ao controller.

const crypto = require('crypto');
const path = require('path');
const { Router } = require('express');
const multer = require('multer');
const documentsController = require('../controllers/documents.controller');
const documentsRepository = require('../repositories/documents.repository');

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, documentsRepository.STORAGE_DIR),
    // nome gerado em disco, nunca o nome original, para evitar colisão e path traversal
    filename: (req, file, cb) => cb(null, `${crypto.randomUUID()}${path.extname(file.originalname)}`),
  }),
});

const router = Router();

router.post('/upload', upload.single('file'), documentsController.upload);
router.get('/documents', documentsController.list);
router.get('/documents/:id/download', documentsController.download);

module.exports = router;
