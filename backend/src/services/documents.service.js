// Regras de negócio do cadastro de documentos.

const fs = require('fs');
const path = require('path');
const documentsRepository = require('../repositories/documents.repository');
const HttpError = require('../errors/http-error');

const DOCUMENT_NOT_FOUND_MESSAGE = 'Documento não encontrado.';

function registerUpload({ file, owner }) {
  validateUploadInput({ file, owner });

  const metadata = buildMetadata({ file, owner });

  return toPublicMetadata(documentsRepository.save(metadata));
}

function listDocuments(owner) {
  return documentsRepository.findAll(owner).map(toPublicMetadata);
}

function getDocumentForDownload(id) {
  const document = findExistingDocument(id);

  const filePath = documentsRepository.resolveFilePath(document.storedName);
  if (!fs.existsSync(filePath)) {
    throw new HttpError(404, DOCUMENT_NOT_FOUND_MESSAGE);
  }

  return { document, filePath };
}

function validateUploadInput({ file, owner }) {
  if (!file) {
    throw new HttpError(400, 'Nenhum arquivo foi enviado.');
  }
  if (!owner || !owner.trim()) {
    throw new HttpError(400, 'O campo "owner" é obrigatório.');
  }
}

function buildMetadata({ file, owner }) {
  return {
    id: path.parse(file.filename).name,
    originalName: file.originalname,
    storedName: file.filename,
    mimeType: file.mimetype,
    size: file.size,
    uploadedAt: new Date().toISOString(),
    owner,
  };
}

function findExistingDocument(id) {
  const document = documentsRepository.findById(id);
  if (!document) {
    throw new HttpError(404, DOCUMENT_NOT_FOUND_MESSAGE);
  }
  return document;
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
