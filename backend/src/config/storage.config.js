// Configuração do diretório de armazenamento local, seguindo 12-Factor (via env).

const path = require('path');

const STORAGE_DIR = process.env.STORAGE_DIR
  ? path.resolve(process.env.STORAGE_DIR)
  : path.join(__dirname, '..', '..', 'storage');

module.exports = { STORAGE_DIR };
