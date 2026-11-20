import PendingPaymentsView from "@/features/tasks/components/PendingPaymentsView";

// Esta pantalla resuelve sus datos en el cliente mediante la API real de tareas.
export const instant = false;

export const metadata = {
  title: "Pagos pendientes",
  description: "Control de saldos pendientes de trabajos activos y finalizados.",
};

export default function PendingPaymentsPage() {
  return <PendingPaymentsView />;
}
