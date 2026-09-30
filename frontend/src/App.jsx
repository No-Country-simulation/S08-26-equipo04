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

// Desktop conserva top-right; en mobile va arriba al centro para que no se
// pierda abajo (pulgar/scroll). El mobileOffset lo baja debajo del header
// sticky (h-16=64px) del OperarioLayout para no tapar marca/logout.
const usePosicionToast = () => {
  const [posicion, setPosicion] = useState(() =>
    window.matchMedia('(min-width: 1024px)').matches
      ? 'top-right'
      : 'top-center',
  );
  useEffect(() => {
    const consulta = window.matchMedia('(min-width: 1024px)');
    const actualizar = (evento) =>
      setPosicion(evento.matches ? 'top-right' : 'top-center');
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
              <Toaster
                position={posicionToast}
                richColors
                expand
                gap={12}
                visibleToasts={4}
                offset={24}
                mobileOffset={76}
                toastOptions={{ duration: 6000 }}
              />
            </OtFasesProvider>
          </SolicitudesProvider>
        </CotizacionesProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
