import DashboardView from "@/features/dashboard/components/DashboardView";

// Estas pantallas resuelven sus datos en el cliente (servicios + hooks), por lo que
// la navegación no produce un shell instantáneo: se marca el segmento como bloqueante.
export const instant = false;

export const metadata = {
  title: "Dashboard",
  description: "Resumen de tareas, rendimiento y actividad de tu espacio de trabajo.",
};

export default function DashboardPage() {
  return <DashboardView />;
}
