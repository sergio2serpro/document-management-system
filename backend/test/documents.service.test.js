// Testes unitários das regras de negócio de documentos.

const { test, describe } = require('node:test');
const assert = require('node:assert');
const crypto = require('node:crypto');
const documentsService = require('../src/services/documents.service');

function buildFakeFile(overrides = {}) {
  return {
    filename: `${crypto.randomUUID()}.txt`,
    originalname: 'documento.txt',
    mimetype: 'text/plain',
    size: 123,
    ...overrides,
  };
}

describe('documentsService.registerUpload', () => {
  test('rejeita quando não há arquivo', () => {
    assert.throws(
      () => documentsService.registerUpload({ file: null, owner: 'user-1' }),
      (error) => error.statusCode === 400 && /arquivo/i.test(error.message)
    );
  });

  test('rejeita quando owner está vazio', () => {
    assert.throws(
      () => documentsService.registerUpload({ file: buildFakeFile(), owner: '   ' }),
      (error) => error.statusCode === 400 && /owner/i.test(error.message)
    );
  });

  test('registra o documento e não expõe o storedName', () => {
    const owner = crypto.randomUUID();

    const metadata = documentsService.registerUpload({ file: buildFakeFile(), owner });

    assert.strictEqual(metadata.owner, owner);
    assert.strictEqual(metadata.originalName, 'documento.txt');
    assert.strictEqual(metadata.storedName, undefined);
    assert.ok(metadata.id);
    assert.ok(metadata.uploadedAt);
  });
});

describe('documentsService.listDocuments', () => {
  test('lista apenas os documentos do owner informado', () => {
    const owner = crypto.randomUUID();
    documentsService.registerUpload({ file: buildFakeFile(), owner });

    const documents = documentsService.listDocuments(owner);

    assert.ok(documents.length >= 1);
    assert.ok(documents.every((document) => document.owner === owner));
  });
});

describe('documentsService.getDocumentForDownload', () => {
  test('lança erro 404 para id inexistente', () => {
    assert.throws(
      () => documentsService.getDocumentForDownload('id-que-nao-existe'),
      (error) => error.statusCode === 404
    );
  });

  test('lança erro 404 quando o arquivo não existe mais em disco', () => {
    const owner = crypto.randomUUID();
    const metadata = documentsService.registerUpload({ file: buildFakeFile(), owner });

    // nenhum arquivo real foi gravado em disco para este teste, então a busca deve falhar
    assert.throws(
      () => documentsService.getDocumentForDownload(metadata.id),
      (error) => error.statusCode === 404
    );
  });
});
