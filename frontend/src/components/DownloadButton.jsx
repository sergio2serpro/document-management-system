import { useState } from 'react';
import { downloadDocument } from '../services/documentsApi';

export default function DownloadButton({ documentId, fileName }) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState(null);

  async function handleClick() {
    setIsDownloading(true);
    setError(null);
    try {
      await downloadDocument(documentId, fileName);
    } catch (downloadError) {
      setError(downloadError.message);
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <span>
      <button type="button" className="button button-secondary" onClick={handleClick} disabled={isDownloading}>
        {isDownloading ? 'Baixando...' : 'Baixar'}
      </button>
      {error && (
        <span role="alert" className="alert alert-error alert-inline">
          {error}
        </span>
      )}
    </span>
  );
}
