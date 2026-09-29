import { useEffect, useMemo, useState } from "react";
import { RefreshCcw, Search, TriangleAlert } from "lucide-react";
import { toast } from "sonner";
import { extractApiMessage } from "../../api";
import {
  Button,
  Card,
  EmptyState,
  ErrorBanner,
  SkeletonCard,
  Title,
} from "../../components/ui";
import { useNoConformidades } from "../../hooks/useNoConformidades";

// Circuito de No Conformidad del Jefe (HU-2.3, issue #100).
// Lista OTs en NO_CONFORME con las observaciones de Calidad y permite
// mandar fases a rehacer con operario, tiempo estimado y notas.

const RehacerForm = ({
  orden,
  cargarFasesOt,
  cargarOperarios,
  enviarARehacer,
  onEnviado,
}) => {
  const [fases, setFases] = useState(null);
  const [errorFases, setErrorFases] = useState(null);
  const [seleccionadas, setSeleccionadas] = useState({});
  const [operariosPorFase, setOperariosPorFase] = useState({});
  const [enviando, setEnviando] = useState(false);

  // Todos los setState ocurren en callbacks de la promesa (nunca en el
  // cuerpo del efecto) para cumplir react-hooks/set-state-in-effect.
  useEffect(() => {
    let cancelado = false;
    cargarFasesOt(orden.id).then(
      (lista) => {
        if (cancelado) return;
        setFases(lista);
        setErrorFases(null);
      },
      (err) => {
        if (cancelado) return;
        setErrorFases(
          extractApiMessage(err, "No se pudieron cargar las fases."),
        );
      },
    );
    return () => {
      cancelado = true;
    };
  }, [orden.id, cargarFasesOt]);

  // Precarga de la vez anterior (alcance #100): el tiempo arranca con el
  // estimado previo y el operario con el anterior si sigue habilitado.
  const toggleFase = (fase) => {
    const faseId = String(fase.id);
    const catalogoId = fase.fase_catalogo_id ?? fase.faseCatalogoId;
    if (seleccionadas[faseId]) {
      setSeleccionadas((prev) => {
        const siguiente = { ...prev };
        delete siguiente[faseId];
        return siguiente;
      });
      return;
    }
    const tiempoPrevio =
      fase.tiempo_estimado_minutos ?? fase.tiempoEstimadoMinutos;
    setSeleccionadas((prev) => ({
      ...prev,
      [faseId]: {
        operarioId: "",
        tiempoEstimadoMinutos: tiempoPrevio != null ? String(tiempoPrevio) : "",
        nota: "",
      },
    }));
    // Operarios habilitados de la fase, lazy: solo al seleccionarla.
    // Fuera del updater: los efectos secundarios no van en fase de render.
    if (catalogoId != null && operariosPorFase[catalogoId] === undefined) {
      setOperariosPorFase((prev) => ({ ...prev, [catalogoId]: null }));
      cargarOperarios(catalogoId).then(
        (lista) => {
          setOperariosPorFase((actual) => ({ ...actual, [catalogoId]: lista }));
          const habilitados = new Set(lista.map((item) => String(item.id)));
          setSeleccionadas((prev) => {
            const siguiente = { ...prev };
            Object.keys(siguiente).forEach((id) => {
              const item = (fases ?? []).find((f) => String(f.id) === id);
              const cat = item?.fase_catalogo_id ?? item?.faseCatalogoId;
              const previo = item?.operario_id ?? item?.operarioId;
              if (
                String(cat) === String(catalogoId) &&
                !siguiente[id].operarioId &&
                previo != null &&
                habilitados.has(String(previo))
              ) {
                siguiente[id] = {
                  ...siguiente[id],
                  operarioId: String(previo),
                };
              }
            });
            return siguiente;
          });
        },
        () =>
          setOperariosPorFase((actual) => ({ ...actual, [catalogoId]: [] })),
      );
    }
  };

  const actualizar = (faseId, campo, valor) => {
    setSeleccionadas((prev) => ({
      ...prev,
      [faseId]: { ...prev[faseId], [campo]: valor },
    }));
  };

  const idsSeleccionados = Object.keys(seleccionadas);
  const puedeEnviar =
    idsSeleccionados.length > 0 &&
    idsSeleccionados.every(
      (id) =>
        seleccionadas[id].operarioId !== "" &&
        Number(seleccionadas[id].tiempoEstimadoMinutos) >= 1,
    );

  const handleEnviar = async () => {
    setEnviando(true);
    try {
      const { notasFallidas } = await enviarARehacer({
        ordenTrabajoId: orden.id,
        selecciones: idsSeleccionados.map((id) => ({
          faseId: Number(id),
          operarioId: Number(seleccionadas[id].operarioId),
          tiempoEstimadoMinutos: Number(
            seleccionadas[id].tiempoEstimadoMinutos,
          ),
          nota: seleccionadas[id].nota,
        })),
      });
      toast.success(
        `${orden.numero_ot} vuelve a producción con ${idsSeleccionados.length} fase(s) a rehacer.`,
      );
      if (notasFallidas.length > 0) {
        toast.warning(
          "El rehacer se registró, pero alguna nota no se pudo guardar.",
        );
      }
      onEnviado();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setEnviando(false);
    }
  };

  if (errorFases) return <ErrorBanner message={errorFases} />;
  if (fases === null) {
    return (
      <div className="space-y-3" role="status" aria-label="Cargando fases...">
        <SkeletonCard rows={2} />
        <span className="sr-only">Cargando fases...</span>
      </div>
    );
  }
  if (fases.length === 0) {
    return (
      <p className="text-body text-text-secondary">
        No hay fases terminadas para rehacer en esta orden.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {fases.map((fase) => {
        const id = String(fase.id);
        const marcada = Boolean(seleccionadas[id]);
        const nombre = fase.fase_nombre ?? fase.faseNombre ?? "—";
        const numero = fase.numero_secuencia ?? fase.numeroSecuencia ?? "—";
        const ciclo = fase.ciclo_iteracion ?? fase.cicloIteracion ?? 1;
        const catalogoId = fase.fase_catalogo_id ?? fase.faseCatalogoId;
        const operarios = operariosPorFase[catalogoId] ?? null;
        return (
          <div
            key={fase.id}
            className="rounded-lg border border-border px-3 py-3"
          >
            <label
              className="flex cursor-pointer items-center gap-3"
              htmlFor={`rehacer-${fase.id}`}
            >
              <input
                id={`rehacer-${fase.id}`}
                type="checkbox"
                className="h-5 w-5 accent-primary"
                checked={marcada}
                onChange={() => toggleFase(fase)}
              />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-label font-semibold text-ink">
                  {numero} · {nombre}
                </span>
                <span className="block text-metadata text-text-muted">
                  {fase.operario_nombre ? `${fase.operario_nombre} · ` : ""}
                  intento {ciclo}
                </span>
              </span>
            </label>
            {marcada && (
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <label
                  className="block space-y-1.5"
                  htmlFor={`operario-${fase.id}`}
                >
                  <span className="block text-label text-text-secondary">
                    Operario *
                  </span>
                  <select
                    id={`operario-${fase.id}`}
                    className="input"
                    value={seleccionadas[id].operarioId}
                    onChange={(event) =>
                      actualizar(id, "operarioId", event.target.value)
                    }
                    disabled={operarios === null}
                  >
                    <option value="">
                      {operarios === null ? "Cargando…" : "Seleccionar…"}
                    </option>
                    {(operarios ?? []).map((operario) => (
                      <option key={operario.id} value={operario.id}>
                        {operario.nombre ?? `Operario #${operario.id}`}
                      </option>
                    ))}
                  </select>
                  {operarios !== null && operarios.length === 0 && (
                    <span className="block text-metadata text-error">
                      Sin operarios habilitados para esta fase.
                    </span>
                  )}
                </label>
                <label
                  className="block space-y-1.5"
                  htmlFor={`tiempo-${fase.id}`}
                >
                  <span className="block text-label text-text-secondary">
                    Tiempo estimado (min) *
                  </span>
                  <input
                    id={`tiempo-${fase.id}`}
                    type="number"
                    min={1}
                    className="input"
                    placeholder={String(
                      fase.tiempo_estimado_minutos ??
                        fase.tiempoEstimadoMinutos ??
                        "",
                    )}
                    value={seleccionadas[id].tiempoEstimadoMinutos}
                    onChange={(event) =>
                      actualizar(
                        id,
                        "tiempoEstimadoMinutos",
                        event.target.value,
                      )
                    }
                  />
                </label>
                <label
                  className="block space-y-1.5 sm:col-span-2"
                  htmlFor={`nota-${fase.id}`}
                >
                  <span className="block text-label text-text-secondary">
                    Nota para el operario
                  </span>
                  <textarea
                    id={`nota-${fase.id}`}
                    className="input min-h-[64px]"
                    placeholder="Indicaciones del retrabajo"
                    value={seleccionadas[id].nota}
                    onChange={(event) =>
                      actualizar(id, "nota", event.target.value)
                    }
                  />
                </label>
              </div>
            )}
          </div>
        );
      })}
      <Button
        type="button"
        loading={enviando}
        disabled={!puedeEnviar}
        onClick={handleEnviar}
      >
        Derivar ({idsSeleccionados.length})
      </Button>
    </div>
  );
};

export const NoConformidadesPage = () => {
  const {
    ordenes,
    cargando,
    error,
    recargar,
    cargarFasesOt,
    cargarOperarios,
    enviarARehacer,
  } = useNoConformidades();
  const [busqueda, setBusqueda] = useState("");
  const [expandida, setExpandida] = useState(null);

  const ordenesFiltradas = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    if (!texto) return ordenes;
    return ordenes.filter((ot) =>
      [ot.numero_ot, ot.cliente_razon_social, ot.descripcion_pieza].some(
        (value) => value?.toLowerCase().includes(texto),
      ),
    );
  }, [ordenes, busqueda]);

  return (
    <div className="mx-auto w-full max-w-4xl space-y-4 py-2">
      <Title>No conformidades</Title>
      <header>
        <h1 className="text-h1 text-ink">No conformidades</h1>
        <p className="mt-1 text-body text-text-secondary">
          Órdenes rechazadas por Calidad, listas para derivar a rehacer.
        </p>
      </header>

      <label className="relative block" htmlFor="noconf-busqueda">
        <Search
          className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-text-muted"
          aria-hidden="true"
        />
        <input
          id="noconf-busqueda"
          name="busqueda"
          type="search"
          className="input min-h-[56px] w-full pl-10 text-base"
          value={busqueda}
          onChange={(event) => setBusqueda(event.target.value)}
          placeholder="Buscar por OT, cliente o pieza"
          aria-label="Buscar por OT, cliente o pieza"
        />
      </label>

      {error && !cargando && <ErrorBanner message={error} onRetry={recargar} />}

      {cargando ? (
        <ul
          className="grid grid-cols-1 gap-4"
          aria-label="Cargando no conformidades"
        >
          {[0, 1, 2].map((index) => (
            <li key={index}>
              <SkeletonCard rows={3} />
            </li>
          ))}
        </ul>
      ) : ordenesFiltradas.length === 0 ? (
        <EmptyState
          icon={TriangleAlert}
          title="No hay OTs no conformes"
          description="Cuando Calidad rechace una orden, aparecerá aquí para derivarla a rehacer."
          action={
            <Button
              variant="secondary"
              size="lg"
              onClick={recargar}
              className="mt-2 min-h-[56px] w-full"
            >
              <RefreshCcw className="h-5 w-5" aria-hidden="true" />
              Actualizar
            </Button>
          }
        />
      ) : (
        <>
          <ul className="grid grid-cols-1 gap-4">
            {ordenesFiltradas.map((orden) => {
              const observaciones =
                orden.auditoria?.observaciones_generales ??
                orden.auditoria?.observacionesGenerales ??
                null;
              const abierta = expandida === orden.id;
              return (
                <li key={orden.id}>
                  <Card>
                    <p className="text-label font-semibold text-ink">
                      {orden.numero_ot}
                    </p>
                    <p className="mt-1 text-body text-text-secondary">
                      {orden.cliente_razon_social} · {orden.descripcion_pieza}
                      {orden.cantidad != null
                        ? ` · ${orden.cantidad} piezas`
                        : ""}
                    </p>
                    {observaciones && (
                      <p className="mt-2 w-fit rounded-lg bg-error-light px-3 py-2 text-label text-error">
                        Defecto: {observaciones}
                      </p>
                    )}
                    <Button
                      type="button"
                      variant={abierta ? "secondary" : "primary"}
                      className="mt-3"
                      onClick={() => setExpandida(abierta ? null : orden.id)}
                      aria-expanded={abierta}
                    >
                      {abierta
                        ? "Ocultar fases"
                        : "Seleccionar fases a rehacer"}
                    </Button>
                    {abierta && (
                      <div className="mt-3 border-t border-border pt-3">
                        <RehacerForm
                          orden={orden}
                          cargarFasesOt={cargarFasesOt}
                          cargarOperarios={cargarOperarios}
                          enviarARehacer={enviarARehacer}
                          onEnviado={() => setExpandida(null)}
                        />
                      </div>
                    )}
                  </Card>
                </li>
              );
            })}
          </ul>
          <p className="text-metadata text-text-muted">
            {ordenesFiltradas.length}{" "}
            {ordenesFiltradas.length === 1
              ? "orden no conforme"
              : "órdenes no conformes"}
          </p>
        </>
      )}
    </div>
  );
};
