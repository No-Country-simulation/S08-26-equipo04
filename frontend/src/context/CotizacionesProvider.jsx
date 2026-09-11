import { useState } from 'react';
import { mocks } from '../mocks';
import { CotizacionesContext } from './CotizacionesContext';

export const CotizacionesProvider = ({ children }) => {
  const [cotizaciones, setCotizaciones] = useState(mocks.cotizaciones);

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

  return (
    <CotizacionesContext.Provider
      value={{ cotizaciones, agregarCotizacion, actualizarCotizacion }}
    >
      {children}
    </CotizacionesContext.Provider>
  );
};
