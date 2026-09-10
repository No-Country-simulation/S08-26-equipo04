import { useAuth } from '../context/AuthContext';
import { Button, Card, Field } from '../components/ui';

export const LoginPage = () => {
  const { login } = useAuth();
  return <main className="flex min-h-screen items-center justify-center bg-canvas p-4"><Card className="w-full max-w-md"><div className="mb-6"><p className="text-label text-primary">QualityTrack</p><h1 className="mt-2 text-h1 text-ink">Ingresar al sistema</h1><p className="mt-2 text-body text-text-secondary">Usa la sesion demo del equipo para explorar el panel.</p></div><div className="space-y-4"><Field id="email" label="Correo electronico" type="email" value="vendedor@qualitytrack.com" readOnly /><Field id="password" label="Contrasena" type="password" value="qualitytrack" readOnly /><Button type="button" className="w-full" onClick={login}>Ingresar</Button></div></Card></main>;
};