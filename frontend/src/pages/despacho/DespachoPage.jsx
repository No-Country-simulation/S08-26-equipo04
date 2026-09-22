import { useMemo, useState } from "react";
import { PackageCheck } from "lucide-react";
import { toast } from "sonner";
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
import { formatDate, formatDateTime } from "../../api/helpers";

const estadoBadge = {
  DESPACHO: "pending",
  ENTREGADA: "approved",
};

const estadoLabels = {
  DESPACHO: "Lista para entregar",
  ENTREGADA: "Entregada",
};

export const DespachoPage = () => {
  const { ordenesTrabajo, cargando, error, recargar, registrarEntrega } =
    useOrdenesTrabajo();

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
        cell: ({ row }) => (
          <button
            type="button"
            className="font-medium text-primary hover:underline"
            onClick={() => setSelectedOt(row.original)}
          >
            {row.original.numero_ot}
          </button>
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
        accessorKey: "fecha_pase_calidad",
        header: "Aprobada por Calidad",
        cell: ({ getValue }) => {
          const value = getValue();

          return value ? formatDateTime(value) : "—";
        },
      },
      {
        accessorKey: "fecha_esperada_entrega",
        header: "Entrega solicitada",
        cell: ({ getValue }) => formatDate(getValue()),
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
    [],
  );

  const handleCloseModal = () => {
    setSelectedOt(null);
    setReceptorNombre("");
    setSubmitError(null);
  };

  const handleConfirmEntrega = async (event) => {
    event.preventDefault();

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
      const message =
        err?.message || "No se pudo registrar la entrega. Reintente.";
      setSubmitError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <Title>Entregas</Title>

      <div>
        <h1 className="text-h1 text-ink">Entregas</h1>
      </div>

      <div className="max-w-xl">
        <input
          id="entregas-busqueda"
          name="busqueda"
          type="search"
          className="input w-full"
          value={busqueda}
          onChange={(event) => setBusqueda(event.target.value)}
          placeholder="Buscar por OT, cliente o pieza"
          aria-label="Buscar por OT, cliente o pieza"
        />
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
        open={Boolean(selectedOt)}
        onClose={handleCloseModal}
        title="Registrar entrega"
      >
        {selectedOt && (
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
