import React from 'react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import UploadComponent from './UploadComponent';
import { uploadDocument } from '../services/documentsApi';

vi.mock('../services/documentsApi');

function selectFile(input, file) {
  Object.defineProperty(input, 'files', { value: [file] });
  fireEvent.change(input);
}

describe('UploadComponent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('mostra erro ao tentar enviar sem selecionar arquivo', async () => {
    render(<UploadComponent owner="user-1" onUploaded={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: /enviar documento/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Selecione um arquivo para enviar.');
    expect(uploadDocument).not.toHaveBeenCalled();
  });

  test('envia o arquivo selecionado e notifica o componente pai', async () => {
    const onUploaded = vi.fn();
    uploadDocument.mockResolvedValue({ id: '1', originalName: 'a.txt' });

    render(<UploadComponent owner="user-1" onUploaded={onUploaded} />);
    const file = new File(['conteudo'], 'a.txt', { type: 'text/plain' });
    selectFile(screen.getByLabelText(/arquivo/i), file);
    fireEvent.click(screen.getByRole('button', { name: /enviar documento/i }));

    await waitFor(() => expect(onUploaded).toHaveBeenCalledWith({ id: '1', originalName: 'a.txt' }));
    expect(uploadDocument).toHaveBeenCalledWith({ file, owner: 'user-1' });
  });

  test('exibe mensagem de erro quando o envio falha', async () => {
    uploadDocument.mockRejectedValue(new Error('Falha ao enviar o documento.'));

    render(<UploadComponent owner="user-1" onUploaded={vi.fn()} />);
    const file = new File(['conteudo'], 'a.txt', { type: 'text/plain' });
    selectFile(screen.getByLabelText(/arquivo/i), file);
    fireEvent.click(screen.getByRole('button', { name: /enviar documento/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Falha ao enviar o documento.');
  });
});
