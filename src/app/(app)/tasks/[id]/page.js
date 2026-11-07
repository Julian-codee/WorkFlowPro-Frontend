import TaskDetailView from "@/features/tasks/components/TaskDetailView";

// Estas pantallas resuelven sus datos en el cliente (servicios + hooks), por lo que
// la navegación no produce un shell instantáneo: se marca el segmento como bloqueante.
export const instant = false;

export const metadata = {
  title: "Detalle de tarea",
  description: "Consulta, edita y actualiza el estado de una tarea.",
};

export default async function TaskDetailPage({ params }) {
  const { id } = await params;

  return <TaskDetailView taskId={id} />;
}
