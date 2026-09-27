import { useEffect, useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from './context/AuthContext';
import { CotizacionesProvider } from './context/CotizacionesProvider';
import { OtFasesProvider } from './context/OtFasesProvider';
import { SolicitudesProvider } from './context/SolicitudesProvider';
import { AuditoriasProvider } from './context/AuditoriasProvider';
import { AppRoutes } from './routes';
import { OrdenesTrabajoProvider } from "./context/OrdenesTrabajoProvider";

// Desktop conserva top-right; en mobile va abajo al centro para no tapar
// el header (logout), que es el formato principal del operario.
const usePosicionToast = () => {
  const [posicion, setPosicion] = useState(() =>
    window.matchMedia('(min-width: 1024px)').matches
      ? 'top-right'
      : 'bottom-center',
  );
  useEffect(() => {
    const consulta = window.matchMedia('(min-width: 1024px)');
    const actualizar = (evento) =>
      setPosicion(evento.matches ? 'top-right' : 'bottom-center');
    consulta.addEventListener('change', actualizar);
    return () => consulta.removeEventListener('change', actualizar);
  }, []);
  return posicion;
};

export default function App() {
  const posicionToast = usePosicionToast();
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
              <Toaster position={posicionToast} richColors />
            </OtFasesProvider>
          </SolicitudesProvider>
        </CotizacionesProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
