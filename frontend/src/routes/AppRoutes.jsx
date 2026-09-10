import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AppLayout } from '../layouts';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { PlaceholderPage } from '../pages/PlaceholderPage';
import { ProtectedRoute } from './ProtectedRoute';

export const AppRoutes = () => {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="solicitudes" element={<PlaceholderPage title="Solicitudes" description="Gestiona las solicitudes comerciales del equipo." />} />
          <Route element={<ProtectedRoute roles={['GERENTE']} />}><Route path="configuracion" element={<PlaceholderPage title="Configuracion" description="Administra los parametros generales de QualityTrack." />} /></Route>
        </Route>
      </Route>
      <Route path="*" element={<Navigate to={user ? '/' : '/login'} replace />} />
    </Routes>
  );
};