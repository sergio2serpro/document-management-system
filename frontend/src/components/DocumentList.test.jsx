import React from 'react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import DocumentList from './DocumentList';
import { listDocuments } from '../services/documentsApi';

vi.mock('../services/documentsApi');
vi.mock('./DownloadButton', () => ({
  default: ({ fileName }) => React.createElement('button', null, `Baixar ${fileName}`),
}));

describe('DocumentList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('mostra estado de carregamento antes de resolver a listagem', () => {
    listDocuments.mockReturnValue(new Promise(() => {}));

    render(<DocumentList owner="user-1" refreshToken={0} />);

    expect(screen.getByText('Carregando documentos...')).toBeInTheDocument();
  });

  test('mostra estado vazio quando não há documentos', async () => {
    listDocuments.mockResolvedValue([]);

    render(<DocumentList owner="user-1" refreshToken={0} />);

    expect(await screen.findByText('Nenhum documento enviado ainda.')).toBeInTheDocument();
  });

  test('lista os documentos retornados', async () => {
    listDocuments.mockResolvedValue([
      { id: '1', originalName: 'a.txt' },
      { id: '2', originalName: 'b.txt' },
    ]);

    render(<DocumentList owner="user-1" refreshToken={0} />);

    expect(await screen.findByText('a.txt')).toBeInTheDocument();
    expect(screen.getByText('b.txt')).toBeInTheDocument();
  });

  test('mostra mensagem de erro quando a listagem falha', async () => {
    listDocuments.mockRejectedValue(new Error('Falha ao carregar os documentos.'));

    render(<DocumentList owner="user-1" refreshToken={0} />);

    expect(await screen.findByRole('alert')).toHaveTextContent('Falha ao carregar os documentos.');
  });
});
