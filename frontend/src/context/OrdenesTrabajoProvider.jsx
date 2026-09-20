import { useCallback, useState } from "react";
import { useAuth } from "./AuthContext";
import { OrdenesTrabajoContext } from "./OrdenesTrabajoContext";
import ordenesTrabajoMock from "../mocks/ordenes-trabajo.json";

const mapItem = (item) => ({
  ...item,
  numero_ot: item.numero_ot ?? item.numeroOT ?? "OT-—",
  cliente_razon_social: item.cliente_razon_social ?? item.cliente ?? "—",
  descripcion_pieza: item.descripcion_pieza ?? item.pieza_trabajo ?? "—",
  receptor_nombre: item.receptor_nombre ?? null,
  created_at: item.created_at ?? null,
  updated_at: item.updated_at ?? null,
});

export const OrdenesTrabajoProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth();

  const puedeConsultar =
    user?.rol === "VENDEDOR" || user?.rol === "JEFE_PRODUCCION";

  const [ordenesTrabajo, setOrdenesTrabajo] = useState(() =>
    ordenesTrabajoMock.map(mapItem),
  );

  const [error, setError] = useState(null);

  const cargando = false;

  const recargar = useCallback(() => {
    setError(null);

    setOrdenesTrabajo(ordenesTrabajoMock.map(mapItem));
  }, []);

  const fusionar = useCallback((item) => {
    const mapeada = mapItem(item);

    setOrdenesTrabajo((prev) =>
      prev.map((orden) =>
        orden.id === mapeada.id ? { ...orden, ...mapeada } : orden,
      ),
    );

    return mapeada;
  }, []);

  const registrarEntrega = useCallback(
    async ({ id, receptor_nombre }) => {
      const orden = ordenesTrabajo.find((item) => item.id === Number(id));

      if (!orden) {
        throw new Error("No se encontró la orden de trabajo.");
      }

      if (orden.estado !== "DESPACHO") {
        throw new Error(
          "La orden de trabajo no se encuentra en estado Despacho.",
        );
      }

      if (!receptor_nombre?.trim()) {
        throw new Error("Debe indicar el nombre del receptor.");
      }

      const fechaEntrega = new Date().toISOString();

      const respuestaMock = {
        ...orden,
        estado: "ENTREGADA",
        receptor_nombre: receptor_nombre.trim(),
        fecha_entrega: fechaEntrega,
        updated_at: fechaEntrega,
      };

      return fusionar(respuestaMock);
    },
    [ordenesTrabajo, fusionar],
  );

  const obtenerOrdenTrabajo = useCallback(
    (id) => ordenesTrabajo.find((item) => item.id === Number(id)) ?? null,
    [ordenesTrabajo],
  );

  const ordenesDisponibles =
    isAuthenticated && puedeConsultar ? ordenesTrabajo : [];

  return (
    <OrdenesTrabajoContext.Provider
      value={{
        ordenesTrabajo: ordenesDisponibles,
        cargando,
        error,
        recargar,
        registrarEntrega,
        obtenerOrdenTrabajo,
      }}
    >
      {children}
    </OrdenesTrabajoContext.Provider>
  );
};
