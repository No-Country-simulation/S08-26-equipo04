import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';

export const AppLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen bg-canvas text-ink">
      <Sidebar collapsed={collapsed} mobileOpen={mobileOpen} onToggle={() => setCollapsed((value) => !value)} onClose={() => setMobileOpen(false)} role={user?.rol} />
      <div className="flex min-w-0 flex-1 flex-col"><Navbar onMenuClick={() => setMobileOpen(true)} /><main className="flex-1 p-4 sm:p-6"><Outlet /></main></div>
    </div>
  );
};