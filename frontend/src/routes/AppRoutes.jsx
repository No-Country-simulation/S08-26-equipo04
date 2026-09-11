import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AppLayout } from '../layouts';
import { CatalogoFasesPage } from '../pages/config/CatalogoFasesPage';
import { OperariosFasePage } from '../pages/config/OperariosFasePage';
import { CotizacionesPage } from '../pages/cotizaciones/CotizacionesPage';
import { CotizacionFormPage } from '../pages/cotizaciones/CotizacionFormPage';
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
          <Route element={<ProtectedRoute roles={['JEFE_PRODUCCION', 'VENDEDOR', 'GERENTE']} />}>
            <Route path="cotizaciones" element={<CotizacionesPage />} />
            <Route path="cotizaciones/nueva" element={<CotizacionFormPage />} />
            <Route path="cotizaciones/:id/editar" element={<CotizacionFormPage />} />
          </Route>
          <Route element={<ProtectedRoute roles={['GERENTE']} />}>
            <Route path="configuracion" element={<Navigate to="/config/fases" replace />} />
            <Route path="config/fases" element={<CatalogoFasesPage />} />
            <Route path="config/fases/:faseId/operarios" element={<OperariosFasePage />} />
          </Route>
        </Route>
      </Route>
      <Route path="*" element={<Navigate to={user ? '/' : '/login'} replace />} />
    </Routes>
  );
};