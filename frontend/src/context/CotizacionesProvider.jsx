import { useState } from 'react';
import { mocks } from '../mocks';
import { CotizacionesContext } from './CotizacionesContext';

export const CotizacionesProvider = ({ children }) => {
  const [cotizaciones, setCotizaciones] = useState(mocks.cotizaciones);
  const [ordenesTrabajo, setOrdenesTrabajo] = useState(mocks.ordenesTrabajo);

  const agregarCotizacion = (nueva) => {
    setCotizaciones((prev) => [
      ...prev,
      {
        id: Math.max(...prev.map((c) => c.id)) + 1,
        ...nueva,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ]);
  };

  const actualizarCotizacion = (id, datos) => {
    setCotizaciones((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, ...datos, updated_at: new Date().toISOString() }
          : c
      )
    );
  };

  const aprobarCotizacion = (id) => {
    const cotizacion = cotizaciones.find((item) => item.id === id);
    if (!cotizacion || cotizacion.estado !== 'ENVIADA_A_CLIENTE') return null;

    const ahora = new Date().toISOString();
    const nuevaOrden = {
      id: Math.max(0, ...ordenesTrabajo.map((orden) => orden.id)) + 1,
      numero_ot: `OT-2026-${String(ordenesTrabajo.length + 1).padStart(4, '0')}`,
      cotizacion_id: cotizacion.id,
      numero_cotizacion: cotizacion.numero_cotizacion,
      cliente_razon_social: cotizacion.cliente_razon_social,
      cantidad: cotizacion.cantidad || null,
      estado: 'PENDIENTE',
      fecha_inicio_produccion: null,
      fecha_pase_calidad: null,
      fecha_pase_despacho: null,
      fecha_entrega: null,
      receptor_nombre: null,
      created_at: ahora,
      updated_at: ahora,
    };

    setCotizaciones((prev) => prev.map((item) => item.id === id
      ? { ...item, estado: 'APROBADA', fecha_respuesta_cliente: ahora, updated_at: ahora }
      : item));
    setOrdenesTrabajo((prev) => [...prev, nuevaOrden]);
    return nuevaOrden;
  };

  const rechazarCotizacion = (id, motivo) => {
    actualizarCotizacion(id, {
      estado: 'NO_APROBADA',
      motivo_rechazo_cliente: motivo,
      fecha_respuesta_cliente: new Date().toISOString(),
    });
  };

  return (
    <CotizacionesContext.Provider
      value={{ cotizaciones, agregarCotizacion, actualizarCotizacion, aprobarCotizacion, rechazarCotizacion, ordenesTrabajo }}
    >
      {children}
    </CotizacionesContext.Provider>
  );
};
