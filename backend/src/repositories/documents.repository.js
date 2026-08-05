// Persistência dos documentos: metadados em memória e diretório de armazenamento em disco.

const fs = require('fs');
const path = require('path');
const { STORAGE_DIR } = require('../config/storage.config');

fs.mkdirSync(STORAGE_DIR, { recursive: true });

const documentsById = new Map();

function save(metadata) {
  documentsById.set(metadata.id, metadata);
  return metadata;
}

function findAll(owner) {
  const documents = Array.from(documentsById.values());
  if (!owner) {
    return documents;
  }
  return documents.filter((document) => document.owner === owner);
}

function findById(id) {
  return documentsById.get(id) || null;
}

function resolveFilePath(storedName) {
  return path.join(STORAGE_DIR, storedName);
}

module.exports = {
  STORAGE_DIR,
  save,
  findAll,
  findById,
  resolveFilePath,
};
