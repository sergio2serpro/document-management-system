// Regras de negócio do cadastro de documentos.

const fs = require('fs');
const path = require('path');
const documentsRepository = require('../repositories/documents.repository');
const HttpError = require('../errors/http-error');

function registerUpload({ file, owner }) {
  if (!file) {
    throw new HttpError(400, 'Nenhum arquivo foi enviado.');
  }
  if (!owner || !owner.trim()) {
    throw new HttpError(400, 'O campo "owner" é obrigatório.');
  }

  const metadata = {
    id: path.parse(file.filename).name,
    originalName: file.originalname,
    storedName: file.filename,
    mimeType: file.mimetype,
    size: file.size,
    uploadedAt: new Date().toISOString(),
    owner,
  };

  return toPublicMetadata(documentsRepository.save(metadata));
}

function listDocuments(owner) {
  return documentsRepository.findAll(owner).map(toPublicMetadata);
}

function getDocumentForDownload(id) {
  const document = documentsRepository.findById(id);
  if (!document) {
    throw new HttpError(404, 'Documento não encontrado.');
  }

  const filePath = documentsRepository.resolveFilePath(document.storedName);
  if (!fs.existsSync(filePath)) {
    throw new HttpError(404, 'Documento não encontrado.');
  }

  return { document, filePath };
}

function toPublicMetadata(document) {
  const { storedName, ...publicMetadata } = document;
  return publicMetadata;
}

module.exports = {
  HttpError,
  registerUpload,
  listDocuments,
  getDocumentForDownload,
};
