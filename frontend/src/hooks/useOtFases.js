import { useContext } from 'react';
import { OtFasesContext } from '../context/OtFasesContext';

export const useOtFases = () => {
  const context = useContext(OtFasesContext);
  if (!context) throw new Error('useOtFases debe usarse dentro de OtFasesProvider');
  return context;
};