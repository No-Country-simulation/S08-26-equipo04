import { Suspense, lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { AppLayout, OperarioLayout } from "../layouts";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import { ProtectedRoute } from "./ProtectedRoute";
import { LoginPage } from "../pages/LoginPage";
import { LandingPage } from "../pages/LandingPage";

// FE-288: las páginas van con import dinámico para que el build genere un
// chunk por ruta en vez de un único bundle (~1,3 MB). `lazy` exige default
// export y las páginas son named exports, por eso el `.then` mapea.
// Login queda eager: es la primera pintura y no gana nada difiriéndose.
const CatalogoFasesPage = lazy(() =>
  import("../pages/config/CatalogoFasesPage").then((m) => ({
    default: m.CatalogoFasesPage,
  })),
);
const OperariosFasePage = lazy(() =>
  import("../pages/config/OperariosFasePage").then((m) => ({
    default: m.OperariosFasePage,
  })),
);
const CotizacionesPage = lazy(() =>
  import("../pages/cotizaciones/CotizacionesPage").then((m) => ({
    default: m.CotizacionesPage,
  })),
);
const CotizacionFormPage = lazy(() =>
  import("../pages/cotizaciones/CotizacionFormPage").then((m) => ({
    default: m.CotizacionFormPage,
  })),
);
const CotizacionDetailPage = lazy(() =>
  import("../pages/cotizaciones/CotizacionDetailPage").then((m) => ({
    default: m.CotizacionDetailPage,
  })),
);
const DashboardPage = lazy(() =>
  import("../pages/dashboard/DashboardPage").then((m) => ({
    default: m.DashboardPage,
  })),
);
const GestionPlantaPage = lazy(() =>
  import("../pages/planta/GestionPlantaPage").then((m) => ({
    default: m.GestionPlantaPage,
  })),
);
const NoConformidadesPage = lazy(() =>
  import("../pages/jefe/NoConformidadesPage").then((m) => ({
    default: m.NoConformidadesPage,
  })),
);
const SolicitudFormPage = lazy(() =>
  import("../pages/solicitudes/SolicitudFormPage").then((m) => ({
    default: m.SolicitudFormPage,
  })),
);
const SolicitudesPage = lazy(() =>
  import("../pages/solicitudes/SolicitudesPage").then((m) => ({
    default: m.SolicitudesPage,
  })),
);
const OperarioPage = lazy(() =>
  import("../pages/operario/OperarioPage").then((m) => ({
    default: m.OperarioPage,
  })),
);
const CalidadPage = lazy(() =>
  import("../pages/calidad/CalidadPage").then((m) => ({
    default: m.CalidadPage,
  })),
);
const CalidadAuditPage = lazy(() =>
  import("../pages/calidad/CalidadAuditPage").then((m) => ({
    default: m.CalidadAuditPage,
  })),
);
const DespachoPage = lazy(() =>
  import("../pages/despacho/DespachoPage").then((m) => ({
    default: m.DespachoPage,
  })),
);
const OrdenesEntregadasPage = lazy(() =>
  import("../pages/despacho/OrdenesEntregadasPage").then((m) => ({
    default: m.OrdenesEntregadasPage,
  })),
);
const OrdenesTrabajoPage = lazy(() =>
  import("../pages/ordenes-trabajo/OrdenesTrabajoPage").then((m) => ({
    default: m.OrdenesTrabajoPage,
  })),
);
const ExpedientePage = lazy(() =>
  import("../pages/vendedor/ExpedientePage").then((m) => ({
    default: m.ExpedientePage,
  })),
);

export const AppRoutes = () => {
  const { user } = useAuth();
  // El operario no tiene vista de Inicio: entra directo a Mis tareas.
  // Calidad tampoco: entra directo a su panel de control.
  const home =
    user?.rol === "OPERARIO"
      ? "/operario"
      : user?.rol === "CALIDAD"
        ? "/calidad"
        : "/dashboard";
  return (
    <Suspense fallback={<LoadingSpinner label="Cargando vista..." />}>
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route
        path="/login"
        element={user ? <Navigate to={home} replace /> : <LoginPage />}
      />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route
            path="dashboard"
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
          {/* Solicitudes: Vendedor gestiona, Jefe cotiza desde el listado (FE-154).
              /solicitudes/nueva sigue solo Vendedor. */}
          <Route
            element={
              <ProtectedRoute roles={["VENDEDOR", "JEFE_PRODUCCION"]} />
            }
          >
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
          {/* Órdenes de trabajo: Vendedor la usa completa; el Jefe la usa en
              modo lectura + reasignación de fases (FE-274). La entrega sigue
              solo Vendedor en /despacho (issue #157). */}
          <Route
            element={
              <ProtectedRoute roles={["VENDEDOR", "JEFE_PRODUCCION"]} />
            }
          >
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
            <Route path="planta" element={<GestionPlantaPage />} />
            <Route path="no-conformidades" element={<NoConformidadesPage />} />
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
    </Suspense>
  );
};
