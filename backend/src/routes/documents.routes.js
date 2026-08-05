// Definição dos endpoints de documentos: delega a entrada HTTP ao controller.

const crypto = require('crypto');
const path = require('path');
const { Router } = require('express');
const multer = require('multer');
const documentsController = require('../controllers/documents.controller');
const { STORAGE_DIR } = require('../config/storage.config');

const MAX_UPLOAD_SIZE_MB = Number(process.env.MAX_UPLOAD_SIZE_MB) || 20;

const DEFAULT_ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
  'text/csv',
  'image/png',
  'image/jpeg',
  'application/zip',
];

const ALLOWED_MIME_TYPES = process.env.ALLOWED_MIME_TYPES
  ? process.env.ALLOWED_MIME_TYPES.split(',').map((mimeType) => mimeType.trim())
  : DEFAULT_ALLOWED_MIME_TYPES;

function createUnsupportedMimeTypeError(mimeType) {
  const error = new Error(`Tipo de arquivo não permitido: ${mimeType}.`);
  error.statusCode = 400;
  return error;
}

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, STORAGE_DIR),
    // nome gerado em disco, nunca o nome original, para evitar colisão e path traversal
    filename: (req, file, cb) => cb(null, `${crypto.randomUUID()}${path.extname(file.originalname)}`),
  }),
  limits: { fileSize: Math.round(MAX_UPLOAD_SIZE_MB * 1024 * 1024) },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      return cb(createUnsupportedMimeTypeError(file.mimetype));
    }
    cb(null, true);
  },
});

const router = Router();

router.post('/upload', upload.single('file'), documentsController.upload);
router.get('/documents', documentsController.list);
router.get('/documents/:id/download', documentsController.download);

module.exports = router;
