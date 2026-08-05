// Testes unitários do repositório de documentos (metadados em memória).

const { test, describe } = require('node:test');
const assert = require('node:assert');
const path = require('node:path');
const crypto = require('node:crypto');
const documentsRepository = require('../src/repositories/documents.repository');

describe('documentsRepository', () => {
  test('save armazena e findById recupera o documento', () => {
    const id = crypto.randomUUID();
    const metadata = { id, originalName: 'a.txt', storedName: 'stored-a.txt', owner: 'owner-1' };

    documentsRepository.save(metadata);

    assert.deepStrictEqual(documentsRepository.findById(id), metadata);
  });

  test('findById retorna null para id inexistente', () => {
    assert.strictEqual(documentsRepository.findById('id-inexistente'), null);
  });

  test('findAll filtra por owner quando informado', () => {
    const ownerX = crypto.randomUUID();
    const ownerY = crypto.randomUUID();
    documentsRepository.save({ id: crypto.randomUUID(), owner: ownerX });
    documentsRepository.save({ id: crypto.randomUUID(), owner: ownerY });

    const result = documentsRepository.findAll(ownerX);

    assert.ok(result.length > 0);
    assert.ok(result.every((document) => document.owner === ownerX));
  });

  test('findAll retorna todos os documentos quando owner não é informado', () => {
    const id = crypto.randomUUID();
    documentsRepository.save({ id, owner: crypto.randomUUID() });

    const result = documentsRepository.findAll();

    assert.ok(result.some((document) => document.id === id));
  });

  test('resolveFilePath junta o diretório de storage com o nome do arquivo', () => {
    const resolved = documentsRepository.resolveFilePath('arquivo.txt');

    assert.strictEqual(resolved, path.join(documentsRepository.STORAGE_DIR, 'arquivo.txt'));
  });
});
