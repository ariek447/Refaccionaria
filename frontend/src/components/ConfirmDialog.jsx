import { useState } from 'react';
import Modal from './Modal.jsx';

/** Pide confirmación antes de una acción destructiva (eliminar). */
export default function ConfirmDialog({ open, title, message, onConfirm, onClose }) {
  const [working, setWorking] = useState(false);

  const handleConfirm = async () => {
    setWorking(true);
    try {
      await onConfirm();
    } finally {
      setWorking(false);
    }
  };

  return (
    <Modal open={open} title={title} onClose={onClose} size="sm">
      <p className="confirm-message">{message}</p>
      <div className="form-actions">
        <button type="button" className="button button--secondary" onClick={onClose} disabled={working}>
          Cancelar
        </button>
        <button type="button" className="button button--danger" onClick={handleConfirm} disabled={working}>
          {working ? 'Eliminando…' : 'Eliminar'}
        </button>
      </div>
    </Modal>
  );
}
