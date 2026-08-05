import React from 'react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App';
import { listDocuments, uploadDocument } from './services/documentsApi';

vi.mock('./services/documentsApi');

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    listDocuments.mockResolvedValue([]);
  });

  test('renderiza o título e permite alterar o usuário', async () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: /document management system/i })).toBeInTheDocument();

    const ownerInput = screen.getByLabelText(/usuário/i);
    fireEvent.change(ownerInput, { target: { value: 'user-2' } });

    expect(ownerInput).toHaveValue('user-2');
    expect(await screen.findByText('Nenhum documento enviado ainda.')).toBeInTheDocument();
  });

  test('recarrega a listagem após um upload bem-sucedido', async () => {
    uploadDocument.mockResolvedValue({ id: '1', originalName: 'a.txt' });
    render(<App />);
    await screen.findByText('Nenhum documento enviado ainda.');

    const file = new File(['conteudo'], 'a.txt', { type: 'text/plain' });
    const fileInput = screen.getByLabelText(/arquivo/i);
    Object.defineProperty(fileInput, 'files', { value: [file] });
    fireEvent.change(fileInput);
    fireEvent.click(screen.getByRole('button', { name: /enviar documento/i }));

    await waitFor(() => expect(listDocuments).toHaveBeenCalledTimes(2));
  });
});
