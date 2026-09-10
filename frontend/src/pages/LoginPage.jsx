import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../context/AuthContext';
import { mocks } from '../mocks';
import { Button, Card, Field } from '../components/ui';
import { loginSchema, loginDefaults } from '../utils/loginSchema';

export const LoginPage = () => {
  const { login } = useAuth();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: loginDefaults,
  });

  const onSubmit = ({ email, password }) => {
    const account = mocks.auth.find((a) => a.email === email && a.password === password);
    if (!account) {
      setError('root', { type: 'manual', message: 'Credenciales incorrectas. Revisa el correo y la contrasena.' });
      return;
    }
    login(account);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-canvas p-4">
      <Card className="w-full max-w-md">
        <div className="mb-6">
          <p className="text-label text-primary">QualityTrack</p>
          <h1 className="mt-2 text-h1 text-ink">Ingresar al sistema</h1>
          <p className="mt-2 text-body text-text-secondary">
            Usa las credenciales de tu cuenta para acceder al panel.
          </p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <Field
            id="email"
            label="Correo electronico"
            type="email"
            placeholder="nombre@qualitytrack.com"
            autoComplete="username"
            error={errors.email?.message}
            {...register('email')}
          />
          <Field
            id="password"
            label="Contrasena"
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
            error={errors.password?.message}
            {...register('password')}
          />
          {errors.root && (
            <p role="alert" className="rounded-lg bg-error-light p-3 text-label text-error">
              {errors.root.message}
            </p>
          )}
          <Button type="submit" className="w-full">
            Ingresar
          </Button>
        </form>
        <p className="mt-4 text-metadata text-text-muted">
          Cuentas demo: gerente@ / jefe@ / vendedor@qualitytrack.com — contrasena: qualitytrack
        </p>
      </Card>
    </main>
  );
};