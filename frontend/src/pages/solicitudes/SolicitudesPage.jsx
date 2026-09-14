import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSolicitudes } from '../../hooks/useSolicitudes';
import { Badge, Button, Card, CardHeader, CardTitle, Title } from '../../components/ui';

export const SolicitudesPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { solicitudes } = useSolicitudes();
  const solicitudesVisibles = user?.rol === 'VENDEDOR' ? solicitudes.filter((item) => item.vendedor_id === user.id) : solicitudes;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <Title>Solicitudes</Title>
      <div className="flex items-start justify-between gap-4"><div><h1 className="text-h1 text-ink">Solicitudes</h1><p className="mt-1 text-body text-text-secondary">Pedidos de cotización cargados por el equipo comercial.</p></div>{user?.rol === 'VENDEDOR' && <Button onClick={() => navigate('/solicitudes/nueva')}><Plus className="h-4 w-4" />Levantar pedido</Button>}</div>
      <Card><CardHeader><CardTitle>Pedidos registrados</CardTitle></CardHeader><div className="table-container"><table className="table"><thead><tr><th>Número</th><th>Cliente</th><th>Pieza o trabajo</th><th>Entrega esperada</th><th>Estado</th></tr></thead><tbody>{solicitudesVisibles.map((solicitud) => <tr key={solicitud.id}><td className="font-medium text-primary">{solicitud.numero_solicitud}</td><td>{solicitud.cliente_razon_social}</td><td>{solicitud.descripcion_pieza}</td><td>{solicitud.fecha_esperada_entrega || 'Sin fecha'}</td><td><Badge variant={solicitud.estado === 'COTIZADA' ? 'quoted' : 'pending'} type="inline">{solicitud.estado.replace(/_/g, ' ')}</Badge></td></tr>)}</tbody></table><div className="table-footer">{solicitudesVisibles.length} solicitud{solicitudesVisibles.length !== 1 ? 'es' : ''}</div></div></Card>
    </div>
  );
};