import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardHeader, CardTitle, EmptyState } from "../../components/ui";

// FE-288: gráficos del Gerente en módulo aparte para que `recharts` (~350 kB)
// no entre en el bundle inicial ni en el chunk del Dashboard: se carga bajo
// demanda con `React.lazy` solo cuando se renderiza el panel del Gerente.

export const GraficosPlanta = ({ fases }) => (
  <Card>
    <CardHeader>
      <CardTitle>OTs acumuladas por fase</CardTitle>
    </CardHeader>
    {fases.length ? (
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={fases} margin={{ bottom: 28 }}>
          <XAxis
            dataKey="nombre"
            angle={-25}
            textAnchor="end"
            height={60}
            tick={{ fontSize: 12 }}
          />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar
            dataKey="cantidad"
            name="OTs"
            fill="#177245"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    ) : (
      <EmptyState
        title="Sin fases registradas"
        description="No hay acumulaciones para mostrar."
      />
    )}
  </Card>
);

export const GraficosCalidad = ({ calidad }) => (
  <>
    <Card>
      <CardHeader>
        <CardTitle>Conformes vs. no conformes</CardTitle>
      </CardHeader>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={calidad.conformidad}
            dataKey="cantidad"
            nameKey="nombre"
            outerRadius={82}
            label
          >
            {calidad.conformidad.map((item, index) => (
              <Cell
                key={item.nombre}
                fill={["#177245", "#b42318"][index]}
              />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </Card>
    <Card>
      <CardHeader>
        <CardTitle>Retrabajos por fase</CardTitle>
      </CardHeader>
      {calidad.retrabajos.length ? (
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={calidad.retrabajos} margin={{ bottom: 28 }}>
            <XAxis
              dataKey="nombre"
              angle={-25}
              textAnchor="end"
              height={60}
              tick={{ fontSize: 12 }}
            />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar
              dataKey="cantidad"
              name="Retrabajos"
              fill="#b42318"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <EmptyState
          title="Sin retrabajos"
          description="No hay retrabajos registrados por fase."
        />
      )}
    </Card>
  </>
);
