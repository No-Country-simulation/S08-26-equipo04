import { NavLink } from 'react-router-dom';
import { ClipboardList, LayoutDashboard, Menu, PanelLeftClose, Settings, X } from 'lucide-react';

const items = [
  { label: 'Inicio', to: '/', icon: LayoutDashboard, roles: [] },
  { label: 'Solicitudes', to: '/solicitudes', icon: ClipboardList, roles: ['VENDEDOR', 'GERENTE'] },
  { label: 'Configuracion', to: '/configuracion', icon: Settings, roles: ['GERENTE'] },
];

export const Sidebar = ({ collapsed, mobileOpen, onToggle, onClose, role }) => {
  const visibleItems = items.filter(({ roles }) => roles.length === 0 || roles.includes(role));

  return (
    <>
      {mobileOpen && <button aria-label="Cerrar menu" className="fixed inset-0 z-30 bg-ink/30 lg:hidden" onClick={onClose} />}
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-border bg-surface transition-transform lg:static lg:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} ${collapsed ? 'lg:w-20' : ''}`}>
        <div className="flex h-16 items-center justify-between border-b border-border px-4">
          {!collapsed && <span className="text-lg font-semibold text-primary">QualityTrack</span>}
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-text-muted hover:bg-canvas lg:hidden" aria-label="Cerrar menu"><X className="h-5 w-5" /></button>
          <button type="button" onClick={onToggle} className="hidden rounded-lg p-2 text-text-muted hover:bg-canvas lg:block" aria-label={collapsed ? 'Expandir menu' : 'Contraer menu'}>
            {collapsed ? <Menu className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
          </button>
        </div>
        <nav className="flex-1 space-y-1 p-3" aria-label="Navegacion principal">
          {visibleItems.map(({ label, to, icon: Icon }) => (
            <NavLink key={to} to={to} onClick={onClose} className={({ isActive }) => `flex items-center gap-3 rounded-lg px-3 py-2.5 text-label transition-colors ${isActive ? 'bg-primary-tint text-primary' : 'text-text-secondary hover:bg-canvas'}`}>
              <Icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
};