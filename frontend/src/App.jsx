import { useState } from 'react';
import UploadComponent from './components/UploadComponent';
import DocumentList from './components/DocumentList';

export default function App() {
  const [owner, setOwner] = useState('user-1');
  const [refreshToken, setRefreshToken] = useState(0);

  function handleUploaded() {
    setRefreshToken((token) => token + 1);
  }

  return (
    <main className="app-shell">
      <header className="app-header">
        <h1>Document Management System</h1>
        <p>Envie, liste e baixe documentos por usuário.</p>
      </header>

      <section className="card">
        <div className="field">
          <label htmlFor="owner-input">Usuário</label>
          <input
            id="owner-input"
            className="text-input"
            type="text"
            value={owner}
            onChange={(event) => setOwner(event.target.value)}
          />
        </div>
      </section>

      <section className="card">
        <h2>Enviar documento</h2>
        <UploadComponent owner={owner} onUploaded={handleUploaded} />
      </section>

      <section className="card">
        <h2>Documentos</h2>
        <DocumentList owner={owner} refreshToken={refreshToken} />
      </section>
    </main>
  );
}
