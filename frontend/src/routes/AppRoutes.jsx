import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { AppLayout, OperarioLayout } from "../layouts";
import { CatalogoFasesPage } from "../pages/config/CatalogoFasesPage";
import { OperariosFasePage } from "../pages/config/OperariosFasePage";
import { CotizacionesPage } from "../pages/cotizaciones/CotizacionesPage";
import { CotizacionFormPage } from "../pages/cotizaciones/CotizacionFormPage";
import { CotizacionDetailPage } from "../pages/cotizaciones/CotizacionDetailPage";
import { DashboardPage } from "../pages/DashboardPage";
import { LoginPage } from "../pages/LoginPage";
import { GestionPlantaPage } from "../pages/planta/GestionPlantaPage";
import { SolicitudFormPage } from "../pages/solicitudes/SolicitudFormPage";
import { SolicitudesPage } from "../pages/solicitudes/SolicitudesPage";
import { ProtectedRoute } from "./ProtectedRoute";
import { OperarioPage } from "../pages/operario/OperarioPage";
import { CalidadPage } from "../pages/calidad/CalidadPage";
import { CalidadAuditPage } from "../pages/calidad/CalidadAuditPage";
import { DespachoPage } from "../pages/despacho/DespachoPage";
import { OrdenesEntregadasPage } from "../pages/despacho/OrdenesEntregadasPage";
import { OrdenesTrabajoPage } from "../pages/ordenes-trabajo/OrdenesTrabajoPage";
import { ExpedientePage } from "../pages/vendedor/ExpedientePage";

export const AppRoutes = () => {
  const { user } = useAuth();
  // El operario no tiene vista de Inicio: entra directo a Mis tareas.
  // Calidad tampoco: entra directo a su panel de control.
  const home =
    user?.rol === "OPERARIO"
      ? "/operario"
      : user?.rol === "CALIDAD"
        ? "/calidad"
        : "/";
  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to={home} replace /> : <LoginPage />}
      />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route
            index
            element={
              user?.rol === "OPERARIO" ? (
                <Navigate to="/operario" replace />
              ) : user?.rol === "CALIDAD" ? (
                <Navigate to="/calidad" replace />
              ) : (
                <DashboardPage />
              )
            }
          />
          <Route element={<ProtectedRoute roles={["VENDEDOR"]} />}>
            <Route path="solicitudes" element={<SolicitudesPage />} />
          </Route>
          <Route element={<ProtectedRoute roles={["VENDEDOR"]} />}>
            <Route path="solicitudes/nueva" element={<SolicitudFormPage />} />
          </Route>
          {/* Operativa de entrega: solo VENDEDOR puede ejecutar entregas (issue #157).
              Sin permiso -> inicio (/) como el resto de roles. */}
          <Route element={<ProtectedRoute roles={["VENDEDOR"]} />}>
            <Route path="despacho" element={<DespachoPage />} />
          </Route>
          {/* Historial solo lectura: VENDEDOR y JEFE_PRODUCCION. Sin acción de entrega. */}
          <Route
            element={
              <ProtectedRoute roles={["VENDEDOR", "JEFE_PRODUCCION"]} />
            }
          >
            <Route
              path="ordenes-entregadas"
              element={<OrdenesEntregadasPage />}
            />
          </Route>
          <Route element={<ProtectedRoute roles={["VENDEDOR"]} />}>
            <Route path="ordenes-trabajo" element={<OrdenesTrabajoPage />} />
            <Route path="ordenes-trabajo/:id" element={<ExpedientePage />} />
          </Route>
          <Route
            element={<ProtectedRoute roles={["JEFE_PRODUCCION", "VENDEDOR"]} />}
          >
            <Route path="cotizaciones" element={<CotizacionesPage />} />
            <Route path="cotizaciones/:id" element={<CotizacionDetailPage />} />
          </Route>
          <Route element={<ProtectedRoute roles={["JEFE_PRODUCCION"]} />}>
            <Route path="cotizaciones/nueva" element={<CotizacionFormPage />} />
            <Route
              path="cotizaciones/:id/editar"
              element={<CotizacionFormPage />}
            />
            <Route path="planta" element={<GestionPlantaPage />} />
          </Route>
          <Route element={<ProtectedRoute roles={["GERENTE"]} />}>
            <Route
              path="configuracion"
              element={<Navigate to="/config/fases" replace />}
            />
            <Route path="config/fases" element={<CatalogoFasesPage />} />
            <Route
              path="config/fases/:faseId/operarios"
              element={<OperariosFasePage />}
            />
          </Route>
        </Route>
        {/* Formato planta (mobile-first, sin sidebar): Operario y Calidad
            comparten el header con nombre + logout arriba a la derecha. */}
        <Route element={<ProtectedRoute roles={["OPERARIO", "CALIDAD"]} />}>
          <Route element={<OperarioLayout />}>
            <Route element={<ProtectedRoute roles={["OPERARIO"]} />}>
              <Route path="operario" element={<OperarioPage />} />
            </Route>
            <Route element={<ProtectedRoute roles={["CALIDAD"]} />}>
              <Route path="calidad" element={<CalidadPage />} />
              <Route path="calidad/:id" element={<CalidadAuditPage />} />
            </Route>
          </Route>
        </Route>
      </Route>
      <Route
        path="*"
        element={<Navigate to={user ? home : "/login"} replace />}
      />
    </Routes>
  );
};
