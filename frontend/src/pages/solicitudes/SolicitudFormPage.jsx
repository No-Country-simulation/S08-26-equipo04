import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { ArrowLeft, FileUp, Paperclip, Save, X } from 'lucide-react';
import { mocks } from '../../mocks';
import { useAuth } from '../../context/AuthContext';
import { useSolicitudes } from '../../hooks/useSolicitudes';
import { Button, Card, CardHeader, CardTitle, Field } from '../../components/ui';
import { solicitudDefaults, solicitudSchema } from '../../utils/solicitudSchema';

const formatBytes = (bytes) => `${(bytes / 1024 / 1024).toFixed(2)} MB`;

export const SolicitudFormPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { agregarSolicitud } = useSolicitudes();
  const [archivos, setArchivos] = useState([]);
  const [arrastrando, setArrastrando] = useState(false);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(solicitudSchema), defaultValues: solicitudDefaults });

  const agregarArchivos = (files) => {
    const nuevos = Array.from(files).filter((file) => !archivos.some((item) => item.name === file.name));
    const total = [...archivos, ...nuevos];
    setArchivos(total);
    setValue('adjuntos', total, { shouldValidate: true });
  };

  const quitarArchivo = (name) => {
    const restantes = archivos.filter((file) => file.name !== name);
    setArchivos(restantes);
    setValue('adjuntos', restantes, { shouldValidate: true });
  };

  const onSubmit = (data) => {
    const cliente = mocks.clientes.find((item) => item.id === Number(data.cliente_id));
    agregarSolicitud({
      solicitud: {
        cliente_id: Number(data.cliente_id),
        cliente_razon_social: cliente.razon_social,
        vendedor_id: user.id,
        vendedor_nombre: user.nombre,
        descripcion_pieza: data.descripcion_pieza,
        cantidad: Number(data.cantidad),
        fecha_esperada_entrega: data.fecha_esperada_entrega || null,
        notas_comerciales: data.notas_comerciales || '',
        estado: 'PENDIENTE_COTIZACION',
      },
      archivos,
    });
    toast.success('Solicitud creada correctamente');
    navigate('/solicitudes');
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-start gap-4">
        <Button variant="ghost" onClick={() => navigate('/solicitudes')} className="mt-1" aria-label="Volver a solicitudes">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <p className="text-label text-primary">Solicitudes</p>
          <h1 className="mt-1 text-h1 text-ink">Levantar pedido</h1>
          <p className="mt-1 text-body text-text-secondary">Registrá los datos comerciales para iniciar una cotización.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader><CardTitle>Datos del pedido</CardTitle></CardHeader>
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor="cliente_id" className="block text-label text-ink">Cliente<span className="ml-1 text-error" aria-hidden="true">*</span></label>
              <select id="cliente_id" className={`input ${errors.cliente_id ? 'border-error focus:ring-error' : ''}`} {...register('cliente_id')}>
                <option value="">Seleccionar cliente...</option>
                {mocks.clientes.filter((cliente) => cliente.activo).map((cliente) => <option key={cliente.id} value={cliente.id}>{cliente.razon_social}</option>)}
              </select>
              {errors.cliente_id && <p className="text-metadata text-error">{errors.cliente_id.message}</p>}
            </div>
            <Field id="cantidad" type="number" min="1" label="Cantidad de unidades" required error={errors.cantidad?.message} {...register('cantidad')} />
            <Field id="fecha_esperada_entrega" type="date" label="Fecha esperada de entrega" helperText="Fecha solicitada por el cliente" {...register('fecha_esperada_entrega')} />
            <Field id="descripcion_pieza" label="Descripción de la pieza o trabajo" required className="sm:col-span-2" placeholder="Ej.: Eje cilíndrico Ø50 mm" error={errors.descripcion_pieza?.message} {...register('descripcion_pieza')} />
            <div className="space-y-1.5 sm:col-span-2">
              <label htmlFor="notas_comerciales" className="block text-label text-ink">Notas comerciales</label>
              <textarea id="notas_comerciales" rows="4" className="input resize-y" placeholder="Requisitos, urgencia o condiciones acordadas" {...register('notas_comerciales')} />
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader><CardTitle>Planos y documentos</CardTitle></CardHeader>
          <div
            role="button"
            tabIndex={0}
            onClick={() => document.getElementById('adjuntos').click()}
            onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') document.getElementById('adjuntos').click(); }}
            onDragOver={(event) => { event.preventDefault(); setArrastrando(true); }}
            onDragLeave={() => setArrastrando(false)}
            onDrop={(event) => { event.preventDefault(); setArrastrando(false); agregarArchivos(event.dataTransfer.files); }}
            className={`cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors ${arrastrando ? 'border-primary bg-primary-tint' : 'border-border hover:border-primary'}`}
          >
            <FileUp className="mx-auto h-8 w-8 text-primary" />
            <p className="mt-3 text-label text-ink">Arrastrá tus archivos aquí</p>
            <p className="mt-1 text-metadata text-text-muted">o seleccioná planos y documentos desde tu equipo</p>
            <input id="adjuntos" type="file" multiple className="sr-only" onChange={(event) => agregarArchivos(event.target.files)} />
          </div>
          {archivos.length > 0 && <ul className="mt-4 space-y-2" aria-label="Archivos seleccionados">{archivos.map((file) => <li key={file.name} className="flex items-center gap-3 rounded-lg bg-canvas px-3 py-2"><Paperclip className="h-4 w-4 shrink-0 text-primary" /><span className="min-w-0 flex-1 truncate text-body text-ink">{file.name}<span className="ml-2 text-metadata text-text-muted">{formatBytes(file.size)}</span></span><button type="button" onClick={() => quitarArchivo(file.name)} className="rounded p-1 text-text-muted hover:bg-surface hover:text-error" aria-label={`Quitar ${file.name}`}><X className="h-4 w-4" /></button></li>)}</ul>}
        </Card>

        <div className="flex justify-end gap-3">
          <Button variant="secondary" type="button" onClick={() => navigate('/solicitudes')}>Cancelar</Button>
          <Button type="submit" loading={isSubmitting}><Save className="h-4 w-4" />Crear solicitud</Button>
        </div>
      </form>
    </div>
  );
};