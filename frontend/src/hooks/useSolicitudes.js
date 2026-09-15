import { useContext } from 'react';
import { SolicitudesContext } from '../context/SolicitudesContext';

export const useSolicitudes = () => {
  const context = useContext(SolicitudesContext);
  if (!context) throw new Error('useSolicitudes debe usarse dentro de SolicitudesProvider');
  return context;
};