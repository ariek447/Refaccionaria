import { useEffect, useRef } from 'react';
import Icon from './Icons.jsx';

/**
 * Ventana modal basada en <dialog> nativo: el navegador se encarga del
 * fondo oscuro, del foco y de cerrar con la tecla Esc.
 */
export default function Modal({ open, title, onClose, children, size = 'md' }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (open && !dialog.open) {
      dialog.showModal();
      // Enfoca el primer campo del formulario (si lo hay)
      dialog.querySelector('input, select, textarea')?.focus();
    }
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const handleCancel = (event) => {
    event.preventDefault(); // React controla el cierre mediante "open"
    onClose();
  };

  return (
    <dialog ref={dialogRef} className={`modal modal--${size}`} onCancel={handleCancel}>
      {open && (
        <>
          <header className="modal__header">
            <h2>{title}</h2>
            <button type="button" className="icon-button" aria-label="Cerrar" onClick={onClose}>
              <Icon name="close" />
            </button>
          </header>
          <div className="modal__body">{children}</div>
        </>
      )}
    </dialog>
  );
}
