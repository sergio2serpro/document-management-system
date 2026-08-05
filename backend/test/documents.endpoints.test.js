// Testes de integração dos endpoints HTTP de documentos.

const { test, describe, before, after, beforeEach } = require('node:test');
const assert = require('node:assert');
const crypto = require('node:crypto');
const app = require('../src/app');
const documentsRepository = require('../src/repositories/documents.repository');

let server;
let baseUrl;

before(() => {
  server = app.listen(0);
  const { port } = server.address();
  baseUrl = `http://127.0.0.1:${port}`;
});

after(() => {
  server.close();
});

function buildFormData(content, fileName, owner) {
  const formData = new FormData();
  formData.append('file', new Blob([content], { type: 'text/plain' }), fileName);
  if (owner !== undefined) {
    formData.append('owner', owner);
  }
  return formData;
}

describe('POST /upload', () => {
  test('envia um documento com sucesso e retorna os metadados públicos', async () => {
    const owner = crypto.randomUUID();

    const response = await fetch(`${baseUrl}/upload`, {
      method: 'POST',
      body: buildFormData('conteudo de teste', 'relatorio.txt', owner),
    });

    assert.strictEqual(response.status, 201);
    const body = await response.json();
    assert.ok(body.id);
    assert.strictEqual(body.originalName, 'relatorio.txt');
    assert.strictEqual(body.owner, owner);
    assert.strictEqual(body.storedName, undefined);
  });

  test('rejeita upload sem arquivo', async () => {
    const formData = new FormData();
    formData.append('owner', 'user-1');

    const response = await fetch(`${baseUrl}/upload`, { method: 'POST', body: formData });

    assert.strictEqual(response.status, 400);
    const body = await response.json();
    assert.match(body.error, /arquivo/i);
  });

  test('rejeita upload sem owner', async () => {
    const response = await fetch(`${baseUrl}/upload`, {
      method: 'POST',
      body: buildFormData('conteudo', 'sem-owner.txt', undefined),
    });

    assert.strictEqual(response.status, 400);
    const body = await response.json();
    assert.match(body.error, /owner/i);
  });
});

describe('GET /documents', () => {
  test('lista apenas os documentos do owner informado', async () => {
    const owner = crypto.randomUUID();
    await fetch(`${baseUrl}/upload`, { method: 'POST', body: buildFormData('a', 'a.txt', owner) });
    await fetch(`${baseUrl}/upload`, { method: 'POST', body: buildFormData('b', 'b.txt', owner) });

    const response = await fetch(`${baseUrl}/documents?owner=${owner}`);

    assert.strictEqual(response.status, 200);
    const documents = await response.json();
    assert.strictEqual(documents.length, 2);
    assert.ok(documents.every((document) => document.owner === owner));
  });
});

describe('GET /documents/:id/download', () => {
  test('baixa o conteúdo do documento enviado', async () => {
    const owner = crypto.randomUUID();
    const uploadResponse = await fetch(`${baseUrl}/upload`, {
      method: 'POST',
      body: buildFormData('conteudo baixavel', 'download.txt', owner),
    });
    const { id } = await uploadResponse.json();

    const downloadResponse = await fetch(`${baseUrl}/documents/${id}/download`);

    assert.strictEqual(downloadResponse.status, 200);
    assert.strictEqual(await downloadResponse.text(), 'conteudo baixavel');
  });

  test('retorna 404 para id inexistente', async () => {
    const response = await fetch(`${baseUrl}/documents/id-inexistente/download`);

    assert.strictEqual(response.status, 404);
  });
});

describe('Tratamento de erros de borda', () => {
  test('retorna 400 sem vazar stack trace para JSON malformado', async () => {
    const response = await fetch(`${baseUrl}/upload`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: '{ invalido ',
    });

    assert.strictEqual(response.status, 400);
    const body = await response.json();
    assert.ok(body.error);
    assert.strictEqual(body.stack, undefined);
  });

  test('retorna 500 sem vazar stack trace quando ocorre um erro inesperado', async (t) => {
    const originalFindAll = documentsRepository.findAll;
    t.after(() => {
      documentsRepository.findAll = originalFindAll;
    });
    documentsRepository.findAll = () => {
      throw new Error('falha simulada');
    };

    const response = await fetch(`${baseUrl}/documents`);

    assert.strictEqual(response.status, 500);
    const body = await response.json();
    assert.strictEqual(body.error, 'Erro interno do servidor.');
    assert.strictEqual(body.stack, undefined);
  });
});
