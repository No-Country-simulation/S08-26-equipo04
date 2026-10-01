import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { RefreshCw, Search } from 'lucide-react';
import { apiGet, formatFechaEntrega } from '../../api';
import {
  Badge,
  Button,
  Card,
  CardHeader,
  CardTitle,
  DataTable,
  ErrorBanner,
  SkeletonTable,
  Title,
} from '../../components/ui';
import { ReasignarFaseModal } from '../../components/ReasignarFaseModal';
import { useGsapAnimation } from '../../hooks/useGsapAnimation';

const estadoVariant = {
  PENDIENTE: 'queue',
  EN_EJECUCION: 'production',
  EN_COLA: 'queue',
  TERMINADO: 'completed',
  NO_CONFORME: 'quality',
};

const estadoLabel = {
  PENDIENTE: 'Pendiente',
  EN_EJECUCION: 'En ejecución',
  EN_COLA: 'En cola',
  TERMINADO: 'Terminado',
  NO_CONFORME: 'No conforme',
};

// Estados válidos para el filtro ?estado= (los que lleguen fuera de esta
// lista se ignoran y se muestra todo).
const ESTADOS_FASE = Object.keys(estadoLabel);

// Maximo de filas por tabla de operario (el DataTable pagina solo).
const FILAS_POR_OPERARIO = 5;

// Columnas de la tabla por operario: OT asignada, fase, estado y
// vencimiento, mas la acción de reasignar. La secuencia/ciclo viajan como
// texto secundario para trazabilidad.
const columnasFases = [
  {
    accessorKey: 'ot_numero',
    header: 'OT',
  },
  {
    accessorKey: 'fase_nombre',
    header: 'Fase',
    cell: ({ row }) => {
      const fase = row.original;
      const secuencia = fase.numero_secuencia ?? fase.numeroSecuencia ?? null;
      const ciclo = fase.ciclo_iteracion ?? fase.cicloIteracion ?? null;
      return (
        <div className='min-w-0'>
          <p className='font-medium text-ink'>{fase.fase_nombre}</p>
          {(secuencia != null || ciclo != null) && (
            <p className='text-metadata text-text-muted'>
              {secuencia != null ? `Secuencia ${secuencia}` : ''}
              {secuencia != null && ciclo != null ? ' · ' : ''}
              {ciclo != null ? `Ciclo ${ciclo}` : ''}
            </p>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: 'estado',
    header: 'Estado',
    cell: ({ row }) => {
      const fase = row.original;
      const rehacer = fase.es_rehacer ?? fase.esRehacer ?? false;
      return (
        <span className='inline-flex flex-wrap items-center gap-1.5'>
          <Badge variant={estadoVariant[fase.estado] || 'queue'} type='inline'>
            {estadoLabel[fase.estado] || fase.estado}
          </Badge>
          {rehacer === true && <Badge variant='quality'>Rehacer</Badge>}
        </span>
      );
    },
  },
  {
    accessorKey: 'fecha_vencimiento',
    header: 'Vence',
    cell: ({ getValue }) => formatFechaEntrega(getValue()),
  },
];

export const GestionPlantaPage = () => {
  const [faseActual, setFaseActual] = useState(null);
  // Columna de acción estable entre renders para no reiniciar la paginación
  // interna de cada tabla (setFaseActual es estable).
  // Solo fases reasignables (EN_COLA o PENDIENTE): el backend rechaza
  // TERMINADO y EN_EJECUCION, asi que el botón ni se muestra (igual que en
  // el Expediente).
  const columnaAccion = useMemo(
    () => ({
      id: 'reasignar',
      header: 'Acciones',
      enableSorting: false,
      cell: ({ row }) => {
        const fase = row.original;
        const reasignable =
          fase.estado === 'EN_COLA' || fase.estado === 'PENDIENTE';
        if (!reasignable) return null;
        return (
          <Button
            variant='secondary'
            size='sm'
            onClick={() => setFaseActual(fase)}
            aria-label={`Reasignar fase ${fase.fase_nombre ?? ''}`}
          >
            Reasignar
          </Button>
        );
      },
    }),
    [],
  );
  const [otFases, setOtFases] = useState([]);
  const [fasesCatalogo, setFasesCatalogo] = useState([]);
  // Nombre y especialidad por operario. GET /api/usuarios es solo Gerente,
  // asi que el Jefe los resuelve con GET /api/fases/{id}/operarios
  // (permite Jefe) por cada fase del catalogo presente en planta.
  const [detalleOperarios, setDetalleOperarios] = useState(() => new Map());
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [version, setVersion] = useState(0);
  const operarioListRef = useRef(null);

  useEffect(() => {
    let cancelado = false;
    // El catálogo es tolerante a fallos (ej. deploy desactualizado que aún
    // responde 403 al Jefe): sin él la vista igual carga y los nombres caen
    // al fallback `Fase #id`. Solo ot-fases es bloqueante.
    const catalogoSeguro = apiGet('/api/fases', { silenciarToast: true }).then(
      ({ data }) => data ?? [],
      () => [],
    );
    Promise.all([apiGet('/api/ot-fases'), catalogoSeguro])
      .then(([fasesResponse, catalogo]) => {
        if (cancelado) return;
        setOtFases(fasesResponse.data ?? []);
        setFasesCatalogo(catalogo);
        setError(null);
        setCargando(false);
      })
      .catch((err) => {
        if (cancelado) return;
        setError(
          err?.response?.data?.mensaje ||
            err?.response?.data?.message ||
            err?.response?.data?.error ||
            'No se pudo cargar la gestión de planta.',
        );
        setCargando(false);
      });
    return () => {
      cancelado = true;
    };
  }, [version]);

  const recargar = () => {
    setError(null);
    setCargando(true);
    setVersion((v) => v + 1);
  };

  useEffect(() => {
    const catalogoIds = [
      ...new Set(
        otFases
          .map((fase) => fase.faseCatalogoId ?? fase.fase_catalogo_id)
          .filter((id) => id != null),
      ),
    ];
    if (catalogoIds.length === 0) return undefined;
    let cancelado = false;
    Promise.all(
      catalogoIds.map((id) =>
        apiGet(`/api/fases/${id}/operarios`).then(
          ({ data }) => data ?? [],
          () => [],
        ),
      ),
    ).then((listas) => {
      if (cancelado) return;
      const mapa = new Map();
      listas.flat().forEach((item) => {
        if (item?.id != null && !mapa.has(item.id)) {
          mapa.set(item.id, {
            nombre: item.nombre ?? `Operario #${item.id}`,
            tipo_tarea: item.tipo_tarea ?? item.tipoTarea ?? null,
          });
        }
      });
      setDetalleOperarios(mapa);
    });
    return () => {
      cancelado = true;
    };
  }, [otFases]);

  // Filtros por query (?estado=EN_COLA&operario=3): las cards del dashboard
  // enlazan acá ya filtrado en vez de cargar todas las tablas. Sin params
  // se ve todo como antes.
  const [searchParams, setSearchParams] = useSearchParams();
  // Buscador local por OT, pieza o fase (no va a la URL: es solo vista).
  const [busqueda, setBusqueda] = useState('');
  const filtroEstado = ESTADOS_FASE.includes(searchParams.get('estado'))
    ? searchParams.get('estado')
    : null;
  const filtroOperario = searchParams.get('operario')?.trim() || null;
  const hayFiltros = filtroEstado != null || filtroOperario != null;

  const fasesNormalizadas = useMemo(
    () =>
      otFases.map((fase) => ({
        ...fase,
        operario_id: fase.operarioId ?? fase.operario_id,
        fase_nombre:
          fase.fase_nombre ??
          fasesCatalogo.find(
            (item) =>
              item.id === (fase.faseCatalogoId ?? fase.fase_catalogo_id),
          )?.nombre ??
          `Fase #${fase.faseCatalogoId ?? fase.fase_catalogo_id}`,
        // El DTO manda `numeroOt` (numero_ot), no `ot_numero`: leerlo primero
        // para no mostrar el id interno como 'OT #46'.
        ot_numero:
          fase.ot_numero ??
          fase.numero_ot ??
          fase.numeroOt ??
          `OT #${fase.ordenTrabajoId ?? fase.orden_trabajo_id}`,
      })),
    [fasesCatalogo, otFases],
  );

  // Fases visibles tras aplicar el filtro de la query (si hay).
  const fasesFiltradas = useMemo(() => {
    const porEstado =
      filtroEstado != null
        ? fasesNormalizadas.filter((fase) => fase.estado === filtroEstado)
        : fasesNormalizadas;
    const porOperario =
      filtroOperario == null
        ? porEstado
        : porEstado.filter((fase) => {
            const id = fase.operarioId ?? fase.operario_id;
            if (String(id) === filtroOperario) return true;
            const nombre =
              detalleOperarios.get(id)?.nombre ?? fase.operario_nombre ?? '';
            return nombre.toLowerCase().includes(filtroOperario.toLowerCase());
          });
    // Buscador local (OT, pieza o fase): filtra lo ya cargado, sin requests.
    // Se compara como texto (String()) para que matchee aunque algún campo
    // llegue como número o null. La OT matchea por contenido tanto en el
    // número visible como en el id interno.
    const texto = busqueda.trim().toLowerCase();
    if (texto === '') return porOperario;
    return porOperario.filter((fase) =>
      [
        fase.ot_numero,
        fase.ordenTrabajoId ?? fase.orden_trabajo_id,
        fase.descripcion_pieza ?? fase.descripcionPieza,
        fase.fase_nombre,
      ].some(
        (value) =>
          value != null &&
          String(value).toLowerCase().includes(texto),
      ),
    );
  }, [
    fasesNormalizadas,
    filtroEstado,
    filtroOperario,
    detalleOperarios,
    busqueda,
  ]);

  // Grupos por operario sobre todo lo visible (incluye TERMINADO y
  // PENDIENTE: el Jefe las ve para reasignar). El filtro EN_COLA/EN_EJECUCION
  // solo vive en el dashboard (cards) y en la query ?estado=, no acá.
  const operarios = useMemo(() => {
    const ids = [
      ...new Set(
        fasesFiltradas
          .map((fase) => fase.operarioId ?? fase.operario_id)
          .filter(Boolean),
      ),
    ];
    return ids.map((id) => ({
      id,
      nombre: detalleOperarios.get(id)?.nombre ?? `Operario #${id}`,
      tipo_tarea: detalleOperarios.get(id)?.tipo_tarea ?? null,
    }));
  }, [detalleOperarios, fasesFiltradas]);

  const cargaPorOperario = useMemo(() => {
    const grupos = new Map(
      operarios.map((operario) => [
        operario.id,
        {
          ...operario,
          fases: [],
          total: 0,
        },
      ]),
    );

    fasesFiltradas.forEach((fase) => {
      const grupo = grupos.get(fase.operarioId ?? fase.operario_id);
      if (!grupo) return;
      grupo.fases.push(fase);
      grupo.total += 1;
    });

    return Array.from(grupos.values()).filter(
      (grupo) => grupo.fases.length > 0,
    );
  }, [fasesFiltradas, operarios]);

  useGsapAnimation(
    operarioListRef,
    (gsapInstance, scope) => {
      const media = window.matchMedia('(prefers-reduced-motion: reduce)');
      if (media.matches) {
        gsapInstance.set(scope.children, { autoAlpha: 1, y: 0 });
        return;
      }
      gsapInstance.from(scope.children, {
        autoAlpha: 0,
        y: 12,
        stagger: 0.06,
        duration: 0.26,
        ease: 'power2.out',
        clearProps: 'opacity,visibility,transform',
      });
    },
    cargaPorOperario.length,
  );

  const cerrarReasignacion = () => {
    setFaseActual(null);
  };

  // Tras reasignar se actualiza la lista local: la fase cambia de tabla de
  // operario en el proximo render.
  const handleReasignada = (fase, nuevoOperarioId) => {
    setOtFases((prev) =>
      prev.map((item) =>
        item.id === fase.id
          ? {
              ...item,
              operarioId: nuevoOperarioId,
              operario_id: nuevoOperarioId,
            }
          : item,
      ),
    );
  };

  return (
    <div className='mx-auto max-w-7xl space-y-6'>
      <Title>Planta</Title>

      {error && <ErrorBanner message={error} onRetry={recargar} />}

      <div className='flex items-start justify-between gap-4'>
        <div>
          <h1 className='mt-1 text-h1 text-ink'>Planta</h1>
          <p className='mt-2 text-body text-text-secondary'>
            Monitoreá la carga de trabajo por operario y reasigná fases para
            equilibrar la producción.
          </p>
          {hayFiltros && (
            <p className='mt-2 text-label text-text-secondary'>
              Filtrado por
              {filtroEstado != null
                ? ` estado “${estadoLabel[filtroEstado] ?? filtroEstado}”`
                : ''}
              {filtroEstado != null && filtroOperario != null ? ' y' : ''}
              {filtroOperario != null ? ` operario “${filtroOperario}”` : ''}.
              <Button
                variant='discrete'
                size='sm'
                className='ml-1 px-1'
                onClick={() => {
                  setSearchParams({});
                  setBusqueda('');
                }}
              >
                Ver todo
              </Button>
            </p>
          )}
        </div>
        <Button
          variant='secondary'
          onClick={recargar}
          aria-label='Actualizar planta'
        >
          <RefreshCw className='h-4 w-4' />
          Actualizar
        </Button>
      </div>

      {cargando ? (
        <div
          className='grid grid-cols-1 gap-5'
          aria-busy='true'
          aria-label='Cargando carga por operario'
        >
          <SkeletonTable columns={5} rows={5} />
        </div>
      ) : (
        <>
          <div className='relative'>
            <Search
              className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted'
              aria-hidden='true'
            />
            <input
              id='planta-busqueda'
              name='busqueda'
              type='text'
              value={busqueda}
              onChange={(event) => setBusqueda(event.target.value)}
              placeholder='Buscar por OT, pieza o fase…'
              aria-label='Buscar por OT, pieza o fase'
              className='input pl-10'
            />
          </div>
          {!error && cargaPorOperario.length === 0 ? (
            <Card>
              <p className='text-body text-text-secondary'>
                {hayFiltros || busqueda.trim() !== ''
                  ? `Sin resultados${busqueda.trim() !== '' ? ` para “${busqueda.trim()}”` : ''}${hayFiltros ? ' con el filtro aplicado' : ''}.`
                  : 'No hay operarios activos con carga asignada.'}
              </p>
            </Card>
          ) : !error ? (
            <div ref={operarioListRef} className='grid grid-cols-1 gap-5'>
              {cargaPorOperario.map((operario) => (
                <Card key={operario.id} className='space-y-4'>
                  <CardHeader className='mb-0 flex items-center justify-between gap-3'>
                    <div>
                      <CardTitle>{operario.nombre}</CardTitle>
                      <p className='mt-1 text-metadata text-text-muted'>
                        {operario.tipo_tarea || 'Sin especialidad definida'}
                      </p>
                    </div>
                    <Badge variant='production' type='badge'>
                      {operario.total} fase{operario.total !== 1 ? 's' : ''}
                    </Badge>
                  </CardHeader>

                  <DataTable
                    columns={[...columnasFases, columnaAccion]}
                    data={operario.fases}
                    pageSize={FILAS_POR_OPERARIO}
                  />
                </Card>
              ))}
            </div>
          ) : null}
        </>
      )}

      <ReasignarFaseModal
        key={faseActual?.id ?? 'cerrado'}
        fase={faseActual}
        open={Boolean(faseActual)}
        nombreOperarioActual={
          faseActual == null
            ? null
            : (faseActual.operario_nombre ??
              detalleOperarios.get(
                faseActual.operarioId ?? faseActual.operario_id,
              )?.nombre ??
              `Operario #${faseActual.operarioId ?? faseActual.operario_id}`)
        }
        onClose={cerrarReasignacion}
        onReasignada={handleReasignada}
      />
    </div>
  );
};
