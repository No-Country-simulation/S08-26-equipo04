import { Toaster, toast } from "sonner";
import { CheckCircle2, Rocket, Layers } from "lucide-react";

export default function App() {
  const handleTestToast = () => {
    toast.success("¡Setup de QualityTrack funcionando!", {
      description: "Dependencias y estilos cargados correctamente.",
    });
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-6">
      {/* Componente de Toasts global */}
      <Toaster position="top-right" richColors />

      <main className="max-w-md w-full bg-slate-800 border border-slate-700 rounded-xl p-8 shadow-2xl text-center space-y-6">
        <div className="inline-flex items-center justify-center p-3 bg-blue-500/10 text-blue-400 rounded-full mb-2">
          <Rocket className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-white">
            QualityTrack Frontend
          </h1>
          <p className="text-slate-400 text-sm">
            Entorno de desarrollo listo para comenzar
          </p>
        </div>

        <div className="bg-slate-900/50 rounded-lg p-4 text-left border border-slate-700/50 space-y-2">
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <Layers className="w-4 h-4 text-blue-400" />
            <span>Verificación de Setup</span>
          </div>
          <ul className="text-sm space-y-1 text-slate-300">
            <li className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>React 18 + Vite</span>
            </li>
            <li className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Tailwind CSS</span>
            </li>
            <li className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Lucide Icons & Sonner</span>
            </li>
          </ul>
        </div>

        <button
          onClick={handleTestToast}
          className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-medium rounded-lg transition-colors text-sm shadow-md"
        >
          Probar Notificación Toast
        </button>
      </main>
    </div>
  );
}
