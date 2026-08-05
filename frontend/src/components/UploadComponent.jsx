import { useState } from 'react';
import { uploadDocument } from '../services/documentsApi';

export default function UploadComponent({ owner, onUploaded }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(event) {
    event.preventDefault();

    const form = event.target;
    const file = form.elements.file.files[0];
    if (!file) {
      setError('Selecione um arquivo para enviar.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const document = await uploadDocument({ file, owner });
      form.reset();
      onUploaded(document);
    } catch (uploadError) {
      setError(uploadError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="upload-form" onSubmit={handleSubmit}>
      <div className="field-row">
        <div className="field">
          <label htmlFor="file-input">Arquivo</label>
          <input id="file-input" className="file-input" name="file" type="file" />
        </div>
        <button type="submit" className="button button-primary" disabled={isSubmitting}>
          {isSubmitting ? 'Enviando...' : 'Enviar documento'}
        </button>
      </div>
      {error && <p role="alert" className="alert alert-error">{error}</p>}
    </form>
  );
}
