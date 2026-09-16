import { Outlet } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import logoIcon from '../assets/qualitytrack-icon.png';

/**
 * Layout mobile-first exclusivo del Operario (HU-3.1).
 * Sin sidebar ni menu hamburguesa: header fijo con marca a la izquierda
 * y cierre de sesion arriba a la derecha (patron habitual en apps moviles).
 * El contenido se centra en una columna angosta (max-w-md) tipica de app.
 */
export const OperarioLayout = () => {
  const { user, logout } = useAuth();
  const initials =
    user?.nombre
      ?.split(' ')
      .map((part) => part[0])
      .slice(0, 2)
      .join('') || 'OP';

  return (
    <div className="flex min-h-screen flex-col bg-canvas text-ink">
      <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-surface px-4">
        <div className="flex items-center gap-2.5">
          <img src={logoIcon} alt="QualityTrack" className="h-8 w-8 rounded-lg" />
          <p className="text-label font-semibold text-ink">QualityTrack</p>
        </div>
        <div className="flex min-w-0 items-center gap-2">
          <p className="max-w-[120px] truncate text-right text-label font-medium text-ink">
            {user?.nombre || 'Operario'}
          </p>
          <span
            className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-tint text-label text-primary"
            aria-hidden="true"
          >
            {initials}
          </span>
          <button
            type="button"
            onClick={logout}
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg p-2 text-text-muted hover:bg-canvas"
            aria-label="Cerrar sesion"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </header>
      <main className="mx-auto w-full max-w-md flex-1 px-4 pb-10 pt-4 sm:max-w-2xl">
        <Outlet />
      </main>
    </div>
  );
};
