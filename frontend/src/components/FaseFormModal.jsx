import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Field, Modal } from './ui';
import { faseSchema, faseDefaults } from '../utils/faseSchema';

export const FaseFormModal = ({ open, onClose, onSubmit, initialData, loading }) => {
  const isEditing = Boolean(initialData);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(faseSchema),
    defaultValues: faseDefaults,
  });

  useEffect(() => {
    if (open) {
      reset(initialData || faseDefaults);
    }
  }, [open, initialData, reset]);

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
