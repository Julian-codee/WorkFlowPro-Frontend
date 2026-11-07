import TaskCreateView from "@/features/tasks/components/TaskCreateView";

// Estas pantallas resuelven sus datos en el cliente (servicios + hooks), por lo que
// la navegación no produce un shell instantáneo: se marca el segmento como bloqueante.
export const instant = false;

export const metadata = {
  title: "Nueva tarea",
  description: "Crea una nueva tarea en tu espacio de trabajo.",
};

export default function NewTaskPage() {
  return <TaskCreateView />;
}
