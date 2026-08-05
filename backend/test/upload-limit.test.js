// Teste isolado do limite de tamanho de upload (multer), que depende de uma
// variável de ambiente lida na inicialização do módulo de rotas.

const { test, describe } = require('node:test');
const assert = require('node:assert');
const crypto = require('node:crypto');

describe('Limite de tamanho de upload', () => {
  test('retorna 400 quando o arquivo excede o limite configurado', async (t) => {
    const previousEnv = process.env.MAX_UPLOAD_SIZE_MB;
    process.env.MAX_UPLOAD_SIZE_MB = '0.001';
    delete require.cache[require.resolve('../src/app')];
    delete require.cache[require.resolve('../src/routes/documents.routes')];

    const limitedApp = require('../src/app');
    const limitedServer = limitedApp.listen(0);
    const { port } = limitedServer.address();

    t.after(() => {
      limitedServer.close();
      if (previousEnv === undefined) {
        delete process.env.MAX_UPLOAD_SIZE_MB;
      } else {
        process.env.MAX_UPLOAD_SIZE_MB = previousEnv;
      }
      delete require.cache[require.resolve('../src/app')];
      delete require.cache[require.resolve('../src/routes/documents.routes')];
    });

    const formData = new FormData();
    formData.append('file', new Blob(['x'.repeat(4096)], { type: 'text/plain' }), 'grande.txt');
    formData.append('owner', crypto.randomUUID());

    const response = await fetch(`http://127.0.0.1:${port}/upload`, { method: 'POST', body: formData });

    assert.strictEqual(response.status, 400);
    const body = await response.json();
    assert.match(body.error, /tamanho/i);
  });
});
