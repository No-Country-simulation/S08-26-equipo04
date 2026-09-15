import { Menu } from 'lucide-react';

export const Navbar = ({ onMenuClick }) => {
  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-surface px-4 sm:px-6">
      <button type="button" onClick={onMenuClick} className="rounded-lg p-2 text-text-muted hover:bg-canvas lg:hidden" aria-label="Abrir menu"><Menu className="h-5 w-5" /></button>
      <div className="ml-auto" />
    </header>
  );
};