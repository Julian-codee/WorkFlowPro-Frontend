import TasksView from "@/features/tasks/components/TasksView";

export const metadata = {
  title: "Tareas",
  description: "Listado, búsqueda y filtrado de las tareas del espacio de trabajo.",
};

export default function TasksPage() {
  return <TasksView />;
}
