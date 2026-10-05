import { useMemo, useState } from "react";
import { PackageCheck, RefreshCw, Search } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "../../context/AuthContext";
import { useOrdenesTrabajo } from "../../hooks/useOrdenesTrabajo";
import {
  Badge,
  Button,
  Card,
  DataTable,
  EmptyState,
  ErrorBanner,
  Modal,
  SkeletonTable,
  Title,
} from "../../components/ui";
import { formatDateTime, formatFechaEntrega } from "../../api/helpers";

const estadoBadge = {
  DESPACHO: "pending",
  ENTREGADA: "approved",
};

const estadoLabels = {
  DESPACHO: "Lista para entregar",
  ENTREGADA: "Entregada",
};

export const DespachoPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { ordenesTrabajo, cargando, error, recargar, registrarEntrega } =
    useOrdenesTrabajo();

  // Defensa en profundidad: la ruta ya restringe a VENDEDOR,
  // pero la acción también se bloquea a nivel de vista (issue #157).
  const canEntregar = user?.rol === "VENDEDOR";

  const [busqueda, setBusqueda] = useState("");
  const [selectedOt, setSelectedOt] = useState(null);
  const [receptorNombre, setReceptorNombre] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const ordenesDespacho = useMemo(
    () => ordenesTrabajo.filter((ot) => ot.estado === "DESPACHO"),
    [ordenesTrabajo],
  );

  const ordenesFiltradas = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

    if (!texto) {
      return ordenesDespacho;
    }

    return ordenesDespacho.filter((ot) =>
      [ot.numero_ot, ot.cliente_razon_social, ot.descripcion_pieza].some(
        (value) => value?.toLowerCase().includes(texto),
      ),
    );
  }, [ordenesDespacho, busqueda]);

  const columns = useMemo(
    () => [
      {
        accessorKey: "numero_ot",
        header: "Orden de trabajo",
        cell: ({ row }) =>
          canEntregar ? (
            <button
              type="button"
              className="font-medium text-primary hover:underline"
              onClick={() => setSelectedOt(row.original)}
            >
              {row.original.numero_ot}
            </button>
          ) : (
            <span className="font-medium text-ink">
              {row.original.numero_ot}
            </span>
          ),
      },
      {
        accessorKey: "cliente_razon_social",
        header: "Cliente",
        cell: ({ getValue }) => getValue() || "—",
      },
      {
        accessorKey: "descripcion_pieza",
        header: "Pieza o trabajo",
        cell: ({ getValue }) => getValue() || "—",
      },
      {
        accessorKey: "cantidad",
        header: "Cantidad",
        cell: ({ getValue }) => getValue() ?? "—",
      },
      {
        accessorKey: "fecha_pase_despacho",
        header: "Aprobada por Calidad",
        cell: ({ row }) => {
          // fecha_pase_despacho se graba al dar CONFORME (CalidadService);
          // fecha_pase_calidad es solo la entrada a Calidad. Fallback a
          // camelCase por si el DTO llegara sin snake_case.
          const value =
            row.original.fecha_pase_despacho ??
            row.original.fechaPaseDespacho ??
            null;

          return value ? formatDateTime(value) : "—";
        },
      },
      {
        accessorKey: "fecha_esperada_entrega",
        header: "Entrega solicitada",
        cell: ({ getValue }) => formatFechaEntrega(getValue()),
      },
      {
        accessorKey: "estado",
        header: "Estado",
        cell: ({ getValue }) => {
          const estado = getValue();

          return (
            <Badge variant={estadoBadge[estado] || "pending"} type="inline">
              {estadoLabels[estado] || estado}
            </Badge>
          );
        },
      },
    ],
    [canEntregar],
  );

  const handleCloseModal = () => {
    setSelectedOt(null);
    setReceptorNombre("");
    setSubmitError(null);
  };

  const handleConfirmEntrega = async (event) => {
    event.preventDefault();

    // RBAC vista: solo VENDEDOR puede gatillar la entrega.
    // Si otro rol llega aquí (ej. manipulación), se redirige a inicio (/).
    if (!canEntregar) {
      toast.error("No tienes permisos para esta acción.");
      navigate("/dashboard", { replace: true });
      return;
    }

    if (!selectedOt || !receptorNombre.trim()) {
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError(null);

      await registrarEntrega({
        id: selectedOt.id,
        receptor_nombre: receptorNombre.trim(),
      });

      toast.success(
        `${selectedOt.numero_ot} entregada a ${receptorNombre.trim()}`,
      );
      handleCloseModal();
    } catch (err) {
      const status = err?.response?.status ?? err?.status;
      // El backend debe responder 403 para roles no autorizados (issue #157).
      if (status === 403) {
        toast.error("No tienes permisos para esta acción.");
        handleCloseModal();
        navigate("/dashboard", { replace: true });
        return;
      }
      const message =
        err?.response?.data?.mensaje ||
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "No se pudo registrar la entrega. Reintente.";
      const detalles = Array.isArray(err?.response?.data?.detalles)
        ? ` ${err.response.data.detalles.join(" ")}`
        : "";
      const fullMessage = `${message}${detalles}`.trim();
      setSubmitError(fullMessage);
      toast.error(fullMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <Title>Despacho</Title>

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-h1 text-ink">Despacho</h1>
          <p className="mt-1 text-body text-text-secondary">
            Órdenes listas para entregar.{" "}
            <Link
              to="/ordenes-entregadas"
              className="text-primary hover:underline"
            >
              Ver historial de entregadas
            </Link>
          </p>
        </div>
        <Button
          variant="secondary"
          onClick={recargar}
          loading={cargando}
          aria-label="Actualizar despacho"
        >
          <RefreshCw
            className={`h-4 w-4 ${cargando ? "hidden" : ""}`}
            aria-hidden={cargando}
          />
          Actualizar
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="relative flex-1" htmlFor="entregas-busqueda">
          <Search
            className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-text-muted"
            aria-hidden="true"
          />
          <input
            id="entregas-busqueda"
            name="busqueda"
            type="search"
            className="input h-11 w-full pl-10 text-body"
            value={busqueda}
            onChange={(event) => setBusqueda(event.target.value)}
            placeholder="Buscar por OT, cliente o pieza"
            aria-label="Buscar por OT, cliente o pieza"
          />
        </label>
      </div>

      <Card>
        {cargando ? (
          <SkeletonTable columns={7} rows={5} />
        ) : error ? (
          <ErrorBanner message={error} onRetry={recargar} />
        ) : ordenesFiltradas.length === 0 ? (
          <EmptyState
            icon={PackageCheck}
            title="No hay OTs en despacho"
            description="Cuando las órdenes de trabajo pasen el control de calidad, aparecerán aquí para registrar su entrega."
          />
        ) : (
          <DataTable
            columns={columns}
            data={ordenesFiltradas}
            footer={`${ordenesFiltradas.length} ${
              ordenesFiltradas.length === 1 ? "orden lista" : "órdenes listas"
            }`}
          />
        )}
      </Card>

      <Modal
        open={Boolean(selectedOt) && canEntregar}
        onClose={handleCloseModal}
        title="Registrar entrega"
      >
        {selectedOt && canEntregar && (
          <>
            <p className="mt-1 text-body text-text-secondary">
              Confirmar la entrega de la orden{" "}
              <strong className="text-ink">{selectedOt.numero_ot}</strong>.
            </p>

            <form onSubmit={handleConfirmEntrega} className="mt-4 space-y-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="receptor_nombre"
                  className="block text-label text-text-secondary"
                >
                  Nombre de quien recibe / retira{" "}
                  <span className="text-error">*</span>
                </label>

                <input
                  id="receptor_nombre"
                  name="receptor_nombre"
                  type="text"
                  required
                  autoFocus
                  className="input"
                  placeholder="Ej: Roberto Fontana"
                  value={receptorNombre}
                  onChange={(event) => setReceptorNombre(event.target.value)}
                />
              </div>

              {submitError && (
                <p role="alert" className="text-metadata text-error">
                  {submitError}
                </p>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleCloseModal}
                >
                  Cancelar
                </Button>

                <Button type="submit" loading={isSubmitting}>
                  Confirmar entrega
                </Button>
              </div>
            </form>
          </>
        )}
      </Modal>
    </div>
  );
};
