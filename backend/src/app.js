// Servidor backend do Document Management System.
// Uploads são gravados no filesystem local da aplicação via multer com
// diskStorage; nenhum provedor de armazenamento externo é utilizado.

const express = require('express');
const multer = require('multer');
const documentsRoutes = require('./routes/documents.routes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Endpoint de verificação de saúde.
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use(documentsRoutes);

// Tratamento de erros de borda (JSON invalido, falhas do multer, etc.),
// para nunca vazar stack trace ao cliente.
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Corpo da requisição inválido.' });
  }
  if (err instanceof multer.MulterError) {
    const message = err.code === 'LIMIT_FILE_SIZE' ? 'Arquivo excede o tamanho máximo permitido.' : 'Falha ao processar o arquivo enviado.';
    return res.status(400).json({ error: message });
  }
  console.error(err);
  res.status(500).json({ error: 'Erro interno do servidor.' });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`DMS backend ouvindo na porta ${PORT}`);
  });
}

module.exports = app;
