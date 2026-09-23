import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from './context/AuthContext';
import { CotizacionesProvider } from './context/CotizacionesProvider';
import { OtFasesProvider } from './context/OtFasesProvider';
import { SolicitudesProvider } from './context/SolicitudesProvider';
import { AuditoriasProvider } from './context/AuditoriasProvider';
import { AppRoutes } from './routes';
import { OrdenesTrabajoProvider } from "./context/OrdenesTrabajoProvider";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CotizacionesProvider>
          <SolicitudesProvider>
            <OtFasesProvider>
              <OrdenesTrabajoProvider>
                <AuditoriasProvider>
                  <AppRoutes />
                </AuditoriasProvider>
              </OrdenesTrabajoProvider>
              <Toaster position="top-right" richColors />
            </OtFasesProvider>
          </SolicitudesProvider>
        </CotizacionesProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
