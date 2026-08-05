import { describe, test, expect, vi, beforeEach } from 'vitest';
import { uploadDocument, listDocuments, downloadDocument } from './documentsApi';

function jsonResponse(status, body) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  };
}

describe('documentsApi', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  test('uploadDocument envia FormData e retorna os metadados', async () => {
    fetch.mockResolvedValue(jsonResponse(201, { id: '1' }));

    const file = new File(['a'], 'a.txt');
    const result = await uploadDocument({ file, owner: 'user-1' });

    expect(result).toEqual({ id: '1' });
    expect(fetch).toHaveBeenCalledWith('/api/upload', expect.objectContaining({ method: 'POST' }));
  });

  test('uploadDocument lança erro com a mensagem retornada pelo backend', async () => {
    fetch.mockResolvedValue(jsonResponse(400, { error: 'Nenhum arquivo foi enviado.' }));

    await expect(uploadDocument({ file: null, owner: 'user-1' })).rejects.toThrow('Nenhum arquivo foi enviado.');
  });

  test('listDocuments retorna a lista filtrada por owner', async () => {
    fetch.mockResolvedValue(jsonResponse(200, [{ id: '1' }]));

    const result = await listDocuments('user-1');

    expect(result).toEqual([{ id: '1' }]);
    expect(fetch).toHaveBeenCalledWith('/api/documents?owner=user-1');
  });

  test('listDocuments lança mensagem padrão quando o backend não retorna corpo', async () => {
    fetch.mockResolvedValue({ ok: false, status: 500, json: () => Promise.reject(new Error('sem corpo')) });

    await expect(listDocuments()).rejects.toThrow('Falha ao carregar os documentos.');
  });

  test('downloadDocument dispara o download do blob retornado', async () => {
    const blob = new Blob(['conteudo']);
    fetch.mockResolvedValue({ ok: true, status: 200, blob: () => Promise.resolve(blob) });
    global.URL.createObjectURL = vi.fn(() => 'blob:url');
    global.URL.revokeObjectURL = vi.fn();

    await downloadDocument('1', 'a.txt');

    expect(fetch).toHaveBeenCalledWith('/api/documents/1/download');
    expect(URL.createObjectURL).toHaveBeenCalledWith(blob);
    expect(URL.revokeObjectURL).toHaveBeenCalled();
  });

  test('downloadDocument lança erro com a mensagem retornada pelo backend', async () => {
    fetch.mockResolvedValue(jsonResponse(404, { error: 'Documento não encontrado.' }));

    await expect(downloadDocument('id-inexistente', 'a.txt')).rejects.toThrow('Documento não encontrado.');
  });
});
