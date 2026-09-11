import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCotizaciones } from '../../hooks/useCotizaciones';
import { Button, Card, CardHeader, CardTitle, Badge } from '../../components/ui';

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
  const puedeCrear = user?.rol === 'JEFE_PRODUCCION';

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-h1 text-ink">Cotizaciones</h1>
        </div>
        {puedeCrear && (
          <Button onClick={() => navigate('/cotizaciones/nueva')}>
            <Plus className="h-4 w-4" />
            Nueva cotizacion
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cotizaciones registradas</CardTitle>
        </CardHeader>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Numero</th>
                <th>Solicitud</th>
                <th>Cliente</th>
                <th>Precio</th>
                <th>Fases</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {cotizaciones.map((cot) => (
                <tr key={cot.id}>
                  <td>
                    <button
                      type="button"
                      onClick={() => navigate(`/cotizaciones/${cot.id}/editar`)}
                      className="font-medium text-primary hover:underline"
                      aria-label={`Editar ${cot.numero_cotizacion}`}
                    >
                      {cot.numero_cotizacion}
                    </button>
                  </td>
                  <td>{cot.solicitud_numero}</td>
                  <td>{cot.cliente_razon_social}</td>
                  <td>
                    ${cot.precio_final.toLocaleString('es-AR')}
                  </td>
                  <td>{cot.fases.length}</td>
                  <td>
                    <Badge variant={estadoBadge[cot.estado] || 'pending'} type="inline">
                      {cot.estado.replace(/_/g, ' ')}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="table-footer">
            {cotizaciones.length} cotizacion{cotizaciones.length !== 1 ? 'es' : ''}
          </div>
        </div>
      </Card>
    </div>
  );
};
