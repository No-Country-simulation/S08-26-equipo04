import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCotizaciones } from '../../hooks/useCotizaciones';
import { Badge, Title } from '../../components/ui';

const estadoBadge = {
  LISTA_PARA_ENVIAR: 'pending',
  ENVIADA_A_CLIENTE: 'quoted',
  APROBADA: 'approved',
  NO_APROBADA: 'production',
};

export const CotizacionesPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cotizaciones } = useCotizaciones();
  const [busqueda, setBusqueda] = useState('');
  const [estado, setEstado] = useState('TODOS');

  const cotizacionesFiltradas = useMemo(() => cotizaciones.filter((cotizacion) => {
    const texto = busqueda.toLowerCase();
    const coincideTexto = !texto || [cotizacion.numero_cotizacion, cotizacion.cliente_razon_social, cotizacion.solicitud_numero]
      .some((valor) => valor.toLowerCase().includes(texto));
    return coincideTexto && (estado === 'TODOS' || cotizacion.estado === estado);
  }), [busqueda, cotizaciones, estado]);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <Title>Cotizaciones</Title>
      <div>
        <h1 className="text-h1 text-ink">Cotizaciones</h1>
        {user?.rol === 'VENDEDOR' && <p className="mt-1 text-body text-text-secondary">Revisa las cotizaciones y registra la respuesta del cliente.</p>}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <label className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" aria-hidden="true" />
          <input className="input pl-9" value={busqueda} onChange={(event) => setBusqueda(event.target.value)} placeholder="Buscar por cotización, cliente o pieza" aria-label="Buscar cotizaciones" />
        </label>
        <select className="select sm:max-w-xs" value={estado} onChange={(event) => setEstado(event.target.value)} aria-label="Filtrar por estado">
          <option value="TODOS">Todos los estados</option>
          <option value="ENVIADA_A_CLIENTE">Enviada al cliente</option>
          <option value="APROBADA">Aprobada</option>
          <option value="NO_APROBADA">No aprobada</option>
          <option value="LISTA_PARA_ENVIAR">Lista para enviar</option>
        </select>
      </div>

      <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Cotización</th>
                <th>Solicitud</th>
                <th>Cliente</th>
                <th>Pieza o trabajo</th>
                <th>Precio</th>
                <th>Estado</th>
                <th>Actualizada</th>
              </tr>
            </thead>
            <tbody>
              {cotizacionesFiltradas.map((cot) => (
                <tr key={cot.id}>
                  <td>
                    <button
                      type="button"
                      onClick={() => navigate(cot.estado === 'LISTA_PARA_ENVIAR' && user?.rol === 'JEFE_PRODUCCION' ? `/cotizaciones/${cot.id}/editar` : `/cotizaciones/${cot.id}`)}
                      className="font-medium text-primary hover:underline"
                      aria-label={`${cot.estado === 'LISTA_PARA_ENVIAR' && user?.rol === 'JEFE_PRODUCCION' ? 'Editar' : 'Ver'} ${cot.numero_cotizacion}`}
                    >
                      {cot.numero_cotizacion}
                    </button>
                  </td>
                  <td>{cot.solicitud_numero}</td>
                  <td>{cot.cliente_razon_social}</td>
                  <td>{cot.pieza_trabajo || 'Trabajo metalúrgico'}</td>
                  <td>
                    ${cot.precio_final.toLocaleString('es-AR')}
                  </td>
                  <td>
                    <Badge variant={estadoBadge[cot.estado] || 'pending'} type="inline">
                      {({ ENVIADA_A_CLIENTE: 'Enviada al cliente', APROBADA: 'Aprobada', NO_APROBADA: 'No aprobada', LISTA_PARA_ENVIAR: 'Lista para enviar' })[cot.estado]}
                    </Badge>
                  </td>
                  <td>{new Date(cot.updated_at).toLocaleDateString('es-AR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="table-footer">
            {cotizacionesFiltradas.length} cotización{cotizacionesFiltradas.length !== 1 ? 'es' : ''}
          </div>
        </div>
    </div>
  );
};
