import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

export const Modal = ({ open, onClose, title, children, className = '' }) => {
  useEffect(() => {
    if (!open) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section role="dialog" aria-modal="true" aria-labelledby="modal-title" className={`w-full max-w-lg rounded-xl bg-surface p-6 shadow-modal ${className}`}>
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 id="modal-title" className="text-h2 text-ink">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Cerrar" className="rounded-lg p-1 text-text-muted hover:bg-canvas hover:text-ink">
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </section>
    </div>,
    document.body,
  );
};