import { useContext } from 'react';
import { CotizacionesContext } from '../context/CotizacionesContext';

export const useCotizaciones = () => {
  const ctx = useContext(CotizacionesContext);
  if (!ctx) throw new Error('useCotizaciones debe usarse dentro de CotizacionesProvider');
  return ctx;
};
