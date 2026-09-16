import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from './context/AuthContext';
import { CotizacionesProvider } from './context/CotizacionesProvider';
import { SolicitudesProvider } from './context/SolicitudesProvider';
import { AppRoutes } from './routes';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CotizacionesProvider>
          <SolicitudesProvider>
            <AppRoutes />
            <Toaster position="top-right" richColors />
          </SolicitudesProvider>
        </CotizacionesProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
