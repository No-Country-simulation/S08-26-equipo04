import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "../context/AuthContext";
import { Button, Field, Title } from "../components/ui";
import { loginSchema, loginDefaults } from "../utils/loginSchema";
import logoIcon from "../assets/qualitytrack-icon.png";

const PasswordField = ({ id, label, placeholder, error, ...props }) => {
  const [visible, setVisible] = useState(false);
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-label text-ink">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={visible ? "text" : "password"}
          placeholder={placeholder}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`input pr-16 ${error ? "border-error focus:ring-error" : ""}`}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-label text-primary hover:underline"
          tabIndex={-1}
        >
          {visible ? "Ocultar" : "Mostrar"}
        </button>
      </div>
      {error && (
        <p id={`${id}-error`} className="text-metadata text-error">
          {error}
        </p>
      )}
    </div>
  );
};

export const LoginPage = () => {
  const { login } = useAuth();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: loginDefaults,
  });

  const onSubmit = async ({ email, password }) => {
    try {
      await login({ email, password });
    } catch (err) {
      setError("root", {
        type: "manual",
        message: err.message || "Credenciales incorrectas. Revisa el correo y la contrasena.",
      });
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-canvas p-4">
      <Title>Iniciar sesión</Title>
      <div className="flex w-full max-w-5xl flex-col items-stretch overflow-hidden rounded-2xl bg-surface shadow-card lg:flex-row">
        {/* Lado izquierdo - Logo */}
        <div className="flex items-center justify-center bg-surface px-8 py-12 lg:w-1/2 lg:py-0">
          <div className="flex items-center gap-4">
            <img src={logoIcon} alt="QT" className="h-14 w-14 rounded-xl" />
            <span className="text-h2 text-ink">QualityTrack</span>
          </div>
        </div>

        {/* Divider vertical */}
        <div className="hidden lg:block lg:w-px bg-border" />

        {/* Divider horizontal (mobile) */}
        <div className="block lg:hidden h-px bg-border mx-6" />

        {/* Lado derecho - Formulario */}
        <div className="flex items-center justify-center px-8 py-10 lg:w-1/2 lg:py-12">
          <div className="w-full max-w-sm">
            <h1 className="mb-8 text-h1 text-ink">Iniciar sesión</h1>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-5"
              noValidate
            >
              <Field
                id="email"
                label="Correo electrónico"
                type="email"
                placeholder="vendedor@qualitytrack.com"
                autoComplete="username"
                error={errors.email?.message}
                {...register("email")}
              />
              <PasswordField
                id="password"
                label="Contraseña"
                placeholder="••••••••"
                autoComplete="current-password"
                error={errors.password?.message}
                {...register("password")}
              />
              {errors.root && (
                <p
                  role="alert"
                  className="rounded-lg bg-error-light p-3 text-label text-error"
                >
                  {errors.root.message}
                </p>
              )}
              <Button type="submit" loading={isSubmitting} className="w-full mt-2">
                Iniciar sesión
              </Button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
};
