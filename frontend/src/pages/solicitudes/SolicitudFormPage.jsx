import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ArrowLeft, FileUp, Paperclip, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useSolicitudes } from "../../hooks/useSolicitudes";
import { Button, Card, CardTitle, Field, Title } from "../../components/ui";
import {
  solicitudDefaults,
  solicitudSchema,
} from "../../utils/solicitudSchema";
import {
  MAX_ADJUNTO_BYTES,
  TIPOS_ARCHIVO,
  TIPO_ARCHIVO_POR_DEFECTO,
  formatBytes,
  mensajeTamanioMaximo,
  superaTamanioMaximo,
} from "../../utils/adjuntos";

const resumenFallidos = (fallidos) => {
  const nombres = fallidos.map((item) => item.nombre);
  const detalle = fallidos[0]?.mensaje ? ` ${fallidos[0].mensaje}` : "";
  return `La solicitud se creó, pero no se adjuntaron ${nombres.join(", ")}.${detalle}`;
};

export const SolicitudFormPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { agregarSolicitud, clientes } = useSolicitudes();
  // Un item por archivo con su tipo, que es lo que pide POST /api/documentos.
  const [archivos, setArchivos] = useState([]);
  const [rechazados, setRechazados] = useState([]);
  const [arrastrando, setArrastrando] = useState(false);
  const {
    register,
    handleSubmit,
    setValue,
    setError,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(solicitudSchema),
    defaultValues: solicitudDefaults,
  });
  const clienteMode = useWatch({
    control,
    name: "cliente_mode",
  });

  const clienteId = useWatch({
    control,
    name: "cliente_id",
  });

  const clienteSeleccionado = clientes.find(
    (item) => String(item.id) === String(clienteId),
  );

  // Archivos rechazados al elegirlos, o el error del schema si alguno
  // llegara a colarse en la lista.
  const mensajeArchivos = rechazados.length > 0
    ? rechazados.join(" ")
    : errors.adjuntos?.message;

  const sincronizarAdjuntos = (items) => {
    setArchivos(items);
    setValue(
      "adjuntos",
      items.map((item) => item.archivo),
      { shouldValidate: true },
    );
  };

  const agregarArchivos = (files) => {
    const seleccionados = Array.from(files);
    // El backend corta en 10 MB por archivo: se rechaza antes de subir.
    const validos = seleccionados.filter((file) => !superaTamanioMaximo(file));
    setRechazados(
      seleccionados.filter(superaTamanioMaximo).map(mensajeTamanioMaximo),
    );
    const nuevos = validos.filter(
      (file) => !archivos.some((item) => item.archivo.name === file.name),
    );
    sincronizarAdjuntos([
      ...archivos,
      ...nuevos.map((archivo) => ({
        archivo,
        tipoArchivo: TIPO_ARCHIVO_POR_DEFECTO,
      })),
    ]);
  };

  const quitarArchivo = (name) => {
    sincronizarAdjuntos(
      archivos.filter((item) => item.archivo.name !== name),
    );
  };

  const cambiarTipoArchivo = (name, tipoArchivo) => {
    setArchivos((prev) =>
      prev.map((item) =>
        item.archivo.name === name ? { ...item, tipoArchivo } : item,
      ),
    );
  };

  const onSubmit = async (data) => {
    const cliente =
      clienteMode === "registrado"
        ? clientes.find((item) => item.id === Number(data.cliente_id))
        : { id: null, razon_social: data.cliente_razon_social };
    try {
      const { adjuntosFallidos } = await agregarSolicitud({
        solicitud: {
          cliente_id: cliente?.id ?? null,
          cliente_razon_social: cliente?.razon_social,
          vendedor_id: user.id,
          vendedor_nombre: user.nombre,
          descripcion_pieza: data.descripcion_pieza,
          cantidad: Number(data.cantidad),
          fecha_esperada_entrega: data.fecha_esperada_entrega || null,
          notas_comerciales: data.notas_comerciales || "",
          estado: "PENDIENTE_COTIZACION",
          ...(clienteMode === "nuevo" && {
            cliente_nuevo: {
              razon_social: data.cliente_razon_social,
              cuit: data.cliente_cuit.replace(/[\s-]/g, ""),
              contacto_nombre: data.cliente_contacto,
              telefono: data.cliente_telefono,
              email: data.cliente_email,
              direccion: data.cliente_direccion,
            },
          }),
        },
        archivos,
      });
      toast.success("Solicitud creada correctamente");
      if (adjuntosFallidos.length > 0) {
        toast.warning(resumenFallidos(adjuntosFallidos), { duration: 9000 });
      }
      navigate("/solicitudes");
    } catch (err) {
      const response = err?.cause?.response;
      const mensajeError =
        err?.message ||
        response?.data?.mensaje ||
        response?.data?.message ||
        response?.data?.error ||
        response?.data?.detail ||
        "No se pudo crear la solicitud.";
      const esCuitDuplicado =
        response?.status === 409 &&
        /cuit/i.test(mensajeError) &&
        /ya está registrado/i.test(mensajeError);
      if (esCuitDuplicado && clienteMode === "nuevo") {
        setError("cliente_cuit", {
          type: "manual",
          message: "Ya existe un cliente registrado con ese CUIT.",
        });
        return;
      }
      setError("root", {
        type: "manual",
        message: mensajeError,
      });
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <Title>Nueva solicitud</Title>
      <div>
        <button
          type="button"
          onClick={() => navigate("/solicitudes")}
          className="inline-flex items-center gap-1 text-label font-medium text-primary hover:underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Volver a Solicitudes
        </button>
        <div>
          <h1 className="mt-2 text-h1 text-ink">Nueva solicitud</h1>
        </div>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_224px] lg:items-start"
      >
        <div className="space-y-5">
          <Card className="p-0 overflow-hidden">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <CardTitle className="text-label font-medium">Cliente</CardTitle>
              <div
                className="flex rounded-lg bg-canvas p-0.5 text-label"
                role="group"
                aria-label="Tipo de cliente"
              >
                <button
                  type="button"
                  onClick={() =>
                    setValue("cliente_mode", "registrado", {
                      shouldValidate: true,
                    })
                  }
                  className={`rounded-md px-3 py-1.5 ${clienteMode === "registrado" ? "bg-surface font-medium text-ink shadow-sm" : "text-text-muted"}`}
                >
                  Cliente registrado
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setValue("cliente_mode", "nuevo", { shouldValidate: true })
                  }
                  className={`rounded-md px-3 py-1.5 ${clienteMode === "nuevo" ? "bg-surface font-medium text-ink shadow-sm" : "text-text-muted"}`}
                >
                  Nuevo cliente
                </button>
              </div>
            </div>
            <div className="p-4">
              {clienteMode === "registrado" ? (
                <div className="space-y-1.5">
                  <label
                    htmlFor="cliente_id"
                    className="block text-label text-text-secondary"
                  >
                    Cliente
                  </label>
                  <select
                    id="cliente_id"
                    className={`input ${errors.cliente_id ? "border-error focus:ring-error" : ""}`}
                    {...register("cliente_id")}
                  >
                    <option value="">Seleccioná un cliente</option>
                    {clientes
                      .filter((cliente) => cliente.activo !== false)
                      .map((cliente, index) => (
                        <option
                          key={`${cliente.id ?? "sin-id"}-${index}`}
                          value={cliente.id ?? ""}
                        >
                          {cliente.razon_social}
                        </option>
                      ))}
                  </select>
                  {errors.cliente_id && (
                    <p className="text-metadata text-error">
                      {errors.cliente_id.message}
                    </p>
                  )}
                  {clienteSeleccionado && (
                    <div className="mt-3 rounded-lg border border-border bg-canvas p-3">
                      <p className="mb-2 text-label font-medium text-ink">
                        Cliente seleccionado
                      </p>
                      <dl className="grid gap-2 text-body sm:grid-cols-2">
                        <div>
                          <dt className="text-metadata text-text-muted">
                            CUIT
                          </dt>
                          <dd className="text-ink">
                            {clienteSeleccionado.cuit || "—"}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-metadata text-text-muted">
                            Contacto
                          </dt>
                          <dd className="text-ink">
                            {clienteSeleccionado.contacto_nombre || "—"}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-metadata text-text-muted">
                            Correo
                          </dt>
                          <dd className="text-ink">
                            {clienteSeleccionado.email || "—"}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-metadata text-text-muted">
                            Teléfono
                          </dt>
                          <dd className="text-ink">
                            {clienteSeleccionado.telefono || "—"}
                          </dd>
                        </div>
                        <div className="sm:col-span-2">
                          <dt className="text-metadata text-text-muted">
                            Dirección
                          </dt>
                          <dd className="text-ink">
                            {clienteSeleccionado.direccion || "—"}
                          </dd>
                        </div>
                      </dl>
                    </div>
                  )}
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field
                    id="cliente_razon_social"
                    label="Razón social"
                    required
                    error={errors.cliente_razon_social?.message}
                    {...register("cliente_razon_social")}
                  />
                  <Field
                    id="cliente_cuit"
                    label="CUIT"
                    placeholder="XX-XXXXXXXX-X"
                    helperText="11 dígitos o formato XX-XXXXXXXX-X"
                    required
                    inputMode="numeric"
                    error={errors.cliente_cuit?.message}
                    {...register("cliente_cuit")}
                  />
                  <Field
                    id="cliente_contacto"
                    label="Nombre de contacto"
                    required
                    error={errors.cliente_contacto?.message}
                    {...register("cliente_contacto")}
                  />
                  <Field
                    id="cliente_telefono"
                    label="Teléfono"
                    required
                    error={errors.cliente_telefono?.message}
                    {...register("cliente_telefono")}
                  />
                  <Field
                    id="cliente_email"
                    type="email"
                    label="Correo electrónico"
                    required
                    error={errors.cliente_email?.message}
                    {...register("cliente_email")}
                  />
                  <Field
                    id="cliente_direccion"
                    label="Dirección"
                    required
                    error={errors.cliente_direccion?.message}
                    className="sm:col-span-2"
                    {...register("cliente_direccion")}
                  />
                </div>
              )}
            </div>
          </Card>

          <Card className="p-0 overflow-hidden">
            <div className="border-b border-border px-4 py-3">
              <CardTitle className="text-label font-medium">
                Trabajo solicitado
              </CardTitle>
            </div>
            <div className="grid gap-4 p-4 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <label
                  htmlFor="descripcion_pieza"
                  className="block text-label text-text-secondary"
                >
                  Descripción de la pieza o trabajo
                  <span className="ml-1 text-error" aria-hidden="true">
                    *
                  </span>
                </label>
                <textarea
                  id="descripcion_pieza"
                  rows="3"
                  className={`input resize-none ${errors.descripcion_pieza ? "border-error focus:ring-error" : ""}`}
                  {...register("descripcion_pieza")}
                />
                {errors.descripcion_pieza && (
                  <p className="text-metadata text-error">
                    {errors.descripcion_pieza.message}
                  </p>
                )}
              </div>
              <Field
                id="cantidad"
                type="number"
                min="1"
                label="Cantidad de piezas"
                required
                error={errors.cantidad?.message}
                {...register("cantidad")}
              />
              <Field
                id="fecha_esperada_entrega"
                type="date"
                label="Fecha de entrega solicitada (opcional)"
                {...register("fecha_esperada_entrega")}
              />
              <div className="space-y-1.5 sm:col-span-2">
                <label
                  htmlFor="notas_comerciales"
                  className="block text-label text-text-secondary"
                >
                  Notas del cliente (opcional)
                </label>
                <textarea
                  id="notas_comerciales"
                  rows="3"
                  className="input resize-none"
                  {...register("notas_comerciales")}
                />
              </div>
            </div>
          </Card>

          <Card className="p-0 overflow-hidden">
            <div className="border-b border-border px-4 py-3">
              <CardTitle className="text-label font-medium">
                Documentos
              </CardTitle>
            </div>
            <div className="p-4">
              <div
                role="button"
                tabIndex={0}
                onClick={() => document.getElementById("adjuntos").click()}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ")
                    document.getElementById("adjuntos").click();
                }}
                onDragOver={(event) => {
                  event.preventDefault();
                  setArrastrando(true);
                }}
                onDragLeave={() => setArrastrando(false)}
                onDrop={(event) => {
                  event.preventDefault();
                  setArrastrando(false);
                  agregarArchivos(event.dataTransfer.files);
                }}
                className={`cursor-pointer rounded-lg border border-dashed p-4 text-center transition-colors ${arrastrando ? "border-primary bg-primary-tint" : "border-border bg-canvas hover:border-primary"}`}
              >
                <FileUp className="mx-auto h-5 w-5 text-text-muted" />
                <p className="mt-1 text-body text-text-secondary">
                  Arrastrá archivos aquí o
                </p>
                <span className="mt-2 inline-flex rounded-md border border-border bg-surface px-3 py-1.5 text-label font-medium text-ink">
                  Adjuntar documento
                </span>
                <span className="mt-2 block text-metadata text-text-muted">
                  PDF, imagen o CAD. Hasta {formatBytes(MAX_ADJUNTO_BYTES)} por
                  archivo.
                </span>
                <input
                  id="adjuntos"
                  type="file"
                  multiple
                  className="sr-only"
                  onChange={(event) => agregarArchivos(event.target.files)}
                />
              </div>
              {mensajeArchivos && (
                <p
                  role="alert"
                  className="mt-3 rounded-lg bg-error-light p-3 text-metadata text-error"
                >
                  {mensajeArchivos}
                </p>
              )}
              {archivos.length > 0 && (
                <ul
                  className="mt-4 space-y-2"
                  aria-label="Archivos seleccionados"
                >
                  {archivos.map(({ archivo, tipoArchivo }, index) => (
                    <li
                      key={archivo.name}
                      className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-lg bg-canvas px-3 py-2"
                    >
                      <Paperclip className="h-4 w-4 shrink-0 text-primary" />
                      <span className="min-w-0 flex-1 truncate text-body text-ink">
                        {archivo.name}
                        <span className="ml-2 text-metadata text-text-muted">
                          {formatBytes(archivo.size)}
                        </span>
                      </span>
                      <label
                        htmlFor={`adjunto-tipo-${index}`}
                        className="sr-only"
                      >
                        Tipo de {archivo.name}
                      </label>
                      <select
                        id={`adjunto-tipo-${index}`}
                        value={tipoArchivo}
                        onChange={(event) =>
                          cambiarTipoArchivo(archivo.name, event.target.value)
                        }
                        className="select w-auto py-1.5 text-label"
                      >
                        {TIPOS_ARCHIVO.map((tipo) => (
                          <option key={tipo.value} value={tipo.value}>
                            {tipo.label}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => quitarArchivo(archivo.name)}
                        className="rounded p-1 text-text-muted hover:bg-surface hover:text-error"
                        aria-label={`Quitar ${archivo.name}`}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Card>
        </div>

        <div className="order-first rounded-xl border border-border bg-surface p-3 shadow-card lg:order-none lg:sticky lg:top-6">
          {errors.root && (
            <p
              role="alert"
              className="mb-3 rounded-lg bg-error-light p-3 text-label text-error"
            >
              {errors.root.message}
            </p>
          )}
          <Button type="submit" loading={isSubmitting} className="w-full">
            Crear solicitud
          </Button>
          <Button
            variant="secondary"
            type="button"
            onClick={() => navigate("/solicitudes")}
            className="mt-2 w-full"
          >
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
};
