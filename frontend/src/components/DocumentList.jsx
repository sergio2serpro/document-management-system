import { useCallback, useEffect, useState } from 'react';
import { listDocuments } from '../services/documentsApi';
import DownloadButton from './DownloadButton';

export default function DocumentList({ owner, refreshToken }) {
  const [documents, setDocuments] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadDocuments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await listDocuments(owner);
      setDocuments(result);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setIsLoading(false);
    }
  }, [owner]);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments, refreshToken]);

  if (isLoading) {
    return <p className="state-message">Carregando documentos...</p>;
  }

  if (error) {
    return (
      <p role="alert" className="alert alert-error">
        {error}
      </p>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="empty-state">
        <p>Nenhum documento enviado ainda.</p>
      </div>
    );
  }

  return (
    <ul className="document-list">
      {documents.map((document) => (
        <li key={document.id} className="document-item">
          <span className="document-name">{document.originalName}</span>
          <DownloadButton documentId={document.id} fileName={document.originalName} />
        </li>
      ))}
    </ul>
  );
}
