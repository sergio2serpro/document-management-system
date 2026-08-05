// Servidor backend do Document Management System.
// Uploads são gravados no filesystem local da aplicação via multer com
// diskStorage; nenhum provedor de armazenamento externo é utilizado.

const express = require('express');
const documentsRoutes = require('./routes/documents.routes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Endpoint de verificação de saúde.
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use(documentsRoutes);

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`DMS backend ouvindo na porta ${PORT}`);
  });
}

module.exports = app;
