import { useContext } from "react";
import { AuditoriasContext } from "../context/AuditoriasContext";

export const useAuditorias = () => {
  const context = useContext(AuditoriasContext);

  if (!context) {
    throw new Error(
      "useAuditorias debe ser usado dentro de un AuditoriasProvider",
    );
  }

  return context;
};
