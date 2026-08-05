// Entrada/saída HTTP dos endpoints de documentos.

const documentsService = require('../services/documents.service');

function upload(req, res) {
  try {
    const metadata = documentsService.registerUpload({ file: req.file, owner: req.body.owner });
    res.status(201).json(metadata);
  } catch (error) {
    handleError(res, error);
  }
}

function list(req, res) {
  const documents = documentsService.listDocuments(req.query.owner);
  res.json(documents);
}

function download(req, res) {
  try {
    const { document, filePath } = documentsService.getDocumentForDownload(req.params.id);
    res.download(filePath, document.originalName, (error) => {
      // arquivo pode ter sido removido entre a verificação e o envio (condição de corrida)
      if (error && !res.headersSent) {
        handleError(res, { statusCode: 404, message: 'Documento não encontrado.' });
      }
    });
  } catch (error) {
    handleError(res, error);
  }
}

function handleError(res, error) {
  const statusCode = error.statusCode || 500;
  const message = statusCode === 500 ? 'Erro interno do servidor.' : error.message;
  res.status(statusCode).json({ error: message });
}

module.exports = {
  upload,
  list,
  download,
};
