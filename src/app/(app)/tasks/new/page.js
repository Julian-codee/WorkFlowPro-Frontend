import TaskCreateView from "@/features/tasks/components/TaskCreateView";

export const metadata = {
  title: "Nueva tarea",
  description: "Crea una nueva tarea en tu espacio de trabajo.",
};

export default function NewTaskPage() {
  return <TaskCreateView />;
}
