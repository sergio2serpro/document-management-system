// Cliente da API de documentos: consome o backend via fetch usando o prefixo /api.

const API_BASE = '/api';

async function parseErrorMessage(response, fallbackMessage) {
  const body = await response.json().catch(() => null);
  return body?.error || fallbackMessage;
}

async function ensureOk(response, fallbackMessage) {
  if (!response.ok) {
    throw new Error(await parseErrorMessage(response, fallbackMessage));
  }
}

export async function uploadDocument({ file, owner }) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('owner', owner);

  const response = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    body: formData,
  });

  await ensureOk(response, 'Falha ao enviar o documento.');

  return response.json();
}

export async function listDocuments(owner) {
  const query = owner ? `?owner=${encodeURIComponent(owner)}` : '';
  const response = await fetch(`${API_BASE}/documents${query}`);

  await ensureOk(response, 'Falha ao carregar os documentos.');

  return response.json();
}

export async function downloadDocument(id, fileName) {
  const response = await fetch(`${API_BASE}/documents/${id}/download`);

  await ensureOk(response, 'Falha ao baixar o documento.');

  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(objectUrl);
}
