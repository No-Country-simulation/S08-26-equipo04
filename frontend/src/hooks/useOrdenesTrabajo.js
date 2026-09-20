import { useContext } from "react";
import { OrdenesTrabajoContext } from "../context/OrdenesTrabajoContext";

export const useOrdenesTrabajo = () => {
  const context = useContext(OrdenesTrabajoContext);

  if (!context) {
    throw new Error(
      "useOrdenesTrabajo debe ser usado dentro de un OrdenesTrabajoProvider",
    );
  }

  return context;
};
