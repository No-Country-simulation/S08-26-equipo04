import { Bell, Menu, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const initials = user?.nombre?.split(' ').map((part) => part[0]).slice(0, 2).join('') || 'QT';

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-surface px-4 sm:px-6">
      <button type="button" onClick={onMenuClick} className="rounded-lg p-2 text-text-muted hover:bg-canvas lg:hidden" aria-label="Abrir menu"><Menu className="h-5 w-5" /></button>
      <div className="ml-auto flex items-center gap-3">
        <button type="button" className="rounded-lg p-2 text-text-muted hover:bg-canvas" aria-label="Notificaciones"><Bell className="h-5 w-5" /></button>
        <div className="hidden text-right sm:block"><p className="text-label text-ink">{user?.nombre || 'Usuario'}</p><p className="text-metadata text-text-muted">{user?.rol || 'Invitado'}</p></div>
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-tint text-label text-primary">{initials}</span>
        <button type="button" onClick={logout} className="rounded-lg p-2 text-text-muted hover:bg-canvas" aria-label="Cerrar sesion"><LogOut className="h-5 w-5" /></button>
      </div>
    </header>
  );
};