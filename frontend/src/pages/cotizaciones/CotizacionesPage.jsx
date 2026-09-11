import { useNavigate } from 'react-router-dom';
import { Plus, Pencil } from 'lucide-react';
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
          <p className="text-label text-primary">Cotizaciones</p>
          <h1 className="mt-1 text-h1 text-ink">Listado de cotizaciones</h1>
          <p className="mt-2 text-body text-text-secondary">
            Gestiona las cotizaciones y define la secuencia de fases de produccion.
          </p>
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

        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Numero</th>
                <th>Solicitud</th>
                <th>Cliente</th>
                <th>Precio</th>
                <th>Fases</th>
                <th>Estado</th>
                <th className="!text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {cotizaciones.map((cot) => (
                <tr key={cot.id}>
                  <td>
                    <span className="font-medium text-ink">
                      {cot.numero_cotizacion}
                    </span>
                  </td>
                  <td>{cot.solicitud_numero}</td>
                  <td>{cot.cliente_razon_social}</td>
                  <td>
                    ${cot.precio_final.toLocaleString('es-AR')}
                  </td>
                  <td>{cot.fases.length}</td>
                  <td>
                    <Badge variant={estadoBadge[cot.estado] || 'pending'}>
                      {cot.estado.replace(/_/g, ' ')}
                    </Badge>
                  </td>
                  <td>
                    {puedeCrear && (
                      <div className="flex items-center justify-center">
                        <Button
                          variant="ghost"
                          onClick={() =>
                            navigate(`/cotizaciones/${cot.id}/editar`)
                          }
                          className="hover:text-ink"
                          aria-label={`Editar ${cot.numero_cotizacion}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
