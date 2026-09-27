import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Field, Modal } from './ui';
import { apiGet } from '../api';
import {
  faseCreateSchema,
  faseDefaults,
  faseEditSchema,
} from '../utils/faseSchema';

export const FaseFormModal = ({ open, onClose, onSubmit, initialData, loading }) => {
  const isEditing = Boolean(initialData);
  const [operarios, setOperarios] = useState([]);
  const [errorOperarios, setErrorOperarios] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(isEditing ? faseEditSchema : faseCreateSchema),
    defaultValues: faseDefaults,
  });

  useEffect(() => {
    if (open) {
      reset(initialData || faseDefaults);
    }
  }, [open, initialData, reset]);

  // Solo al crear se eligen operarios: el backend exige al menos uno
  // (CrearFaseRequestDTO @NotEmpty) y en edicion se gestionan aparte.
  // Los setState viven en los callbacks (react-hooks/set-state-in-effect).
  useEffect(() => {
    if (!open || isEditing) return undefined;
    let cancelado = false;
    apiGet('/api/usuarios').then(
      ({ data }) => {
        if (cancelado) return;
        setOperarios(data ?? []);
        setErrorOperarios(null);
      },
      () => {
        if (cancelado) return;
        setOperarios([]);
        setErrorOperarios('No se pudieron cargar los operarios.');
      },
    );
    return () => {
      cancelado = true;
    };
  }, [open, isEditing]);

  const handleFormSubmit = (data) => {
    onSubmit(data);
  };

  return (
    <Modal open={open} onClose={onClose} title={isEditing ? 'Editar fase' : 'Nueva fase'}>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4" noValidate>
        <Field
          id="codigo"
          label="Codigo"
          placeholder="Ej: CORTE"
          required
          error={errors.codigo?.message}
          {...register('codigo')}
        />
        <Field
          id="nombre"
          label="Nombre"
          placeholder="Ej: Corte"
          required
          error={errors.nombre?.message}
          {...register('nombre')}
        />
        <Field
          id="descripcion"
          label="Descripcion"
          placeholder="Descripcion de la fase (opcional)"
          error={errors.descripcion?.message}
          {...register('descripcion')}
        />
        {!isEditing && (
          <fieldset>
            <legend className="text-label font-medium text-ink">
              Operarios habilitados <span aria-hidden="true">*</span>
            </legend>
            {errorOperarios ? (
              <p role="alert" className="mt-1 text-label text-error">
                {errorOperarios}
              </p>
            ) : operarios.length === 0 ? (
              <p className="mt-1 text-label text-text-secondary">
                No hay operarios disponibles.
              </p>
            ) : (
              <Controller
                name="operarios_ids"
                control={control}
                render={({ field }) => (
                  <ul className="mt-2 max-h-44 space-y-1 overflow-y-auto rounded-lg border border-border p-2">
                    {operarios.map((operario) => {
                      const seleccionados = field.value ?? [];
                      const marcado = seleccionados.includes(operario.id);
                      return (
                        <li key={operario.id}>
                          <label className="flex min-h-[44px] cursor-pointer items-center gap-2 rounded-lg px-2 py-1 hover:bg-canvas">
                            <input
                              type="checkbox"
                              className="h-4 w-4 accent-primary"
                              checked={marcado}
                              onChange={() =>
                                field.onChange(
                                  marcado
                                    ? seleccionados.filter(
                                        (id) => id !== operario.id,
                                      )
                                    : [...seleccionados, operario.id],
                                )
                              }
                            />
                            <span className="text-label text-ink">
                              {operario.nombre}
                            </span>
                          </label>
                        </li>
                      );
                    })}
                  </ul>
                )}
              />
            )}
            {errors.operarios_ids?.message && (
              <p role="alert" className="mt-1 text-label text-error">
                {errors.operarios_ids.message}
              </p>
            )}
          </fieldset>
        )}
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={onClose} type="button">
            Cancelar
          </Button>
          <Button type="submit" loading={loading}>
            {isEditing ? 'Guardar cambios' : 'Crear fase'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
