import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from './context/AuthContext';
import { CotizacionesProvider } from './context/CotizacionesProvider';
import { AppRoutes } from './routes';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CotizacionesProvider>
          <AppRoutes />
          <Toaster position="top-right" richColors />
        </CotizacionesProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
