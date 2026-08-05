import React from 'react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DownloadButton from './DownloadButton';
import { downloadDocument } from '../services/documentsApi';

vi.mock('../services/documentsApi');

describe('DownloadButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('aciona o download ao clicar', async () => {
    downloadDocument.mockResolvedValue();

    render(<DownloadButton documentId="1" fileName="a.txt" />);
    fireEvent.click(screen.getByRole('button', { name: /baixar/i }));

    await waitFor(() => expect(downloadDocument).toHaveBeenCalledWith('1', 'a.txt'));
  });

  test('exibe erro quando o download falha', async () => {
    downloadDocument.mockRejectedValue(new Error('Falha ao baixar o documento.'));

    render(<DownloadButton documentId="1" fileName="a.txt" />);
    fireEvent.click(screen.getByRole('button', { name: /baixar/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Falha ao baixar o documento.');
  });
});
