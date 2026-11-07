import TasksView from "@/features/tasks/components/TasksView";

// Estas pantallas resuelven sus datos en el cliente (servicios + hooks), por lo que
// la navegación no produce un shell instantáneo: se marca el segmento como bloqueante.
export const instant = false;

export const metadata = {
  title: "Tareas",
  description: "Listado, búsqueda y filtrado de las tareas del espacio de trabajo.",
};

export default function TasksPage() {
  return <TasksView />;
}
