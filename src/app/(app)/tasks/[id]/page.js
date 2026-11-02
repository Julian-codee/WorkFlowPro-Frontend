import TaskDetailView from "@/features/tasks/components/TaskDetailView";

export const metadata = {
  title: "Detalle de tarea",
  description: "Consulta, edita y actualiza el estado de una tarea.",
};

export default async function TaskDetailPage({ params }) {
  const { id } = await params;

  return <TaskDetailView taskId={id} />;
}
