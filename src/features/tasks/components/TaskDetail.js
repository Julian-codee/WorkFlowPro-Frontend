"use client";

import { useState } from "react";
import { CalendarDays, FolderKanban, Trash2, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";

import { Alert, Button, Card, CardBody, CardHeader, Select, useToast } from "@/components/ui";

import { TASK_PRIORITY_OPTIONS, TASK_STATUS_OPTIONS } from "../constants";
import { deleteTask, updateTaskPriority, updateTaskStatus } from "../services/taskService";
import { TaskPriorityBadge, TaskStatusBadge } from "./TaskBadges";
import DeleteTaskDialog from "./DeleteTaskDialog";

function formatDateTime(value) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

/**
 * Panel de detalle de una tarea con acciones rápidas:
 * cambio de estado, cambio de prioridad y eliminación.
 *
 * Las acciones usan los servicios preparados para:
 *   PATCH /tasks/{id}/status
 *   PATCH /tasks/{id}/priority
 *   DELETE /tasks/{id}
 */
export default function TaskDetail({ task, onTaskChange }) {
  const router = useRouter();
  const toast = useToast();

  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [error, setError] = useState(null);

  if (!task) return null;

  const handleStatusChange = async (event) => {
    const status = event.target.value;
    setIsUpdating(true);
    setError(null);

    try {
      const updated = await updateTaskStatus(task.id, status);
      onTaskChange?.(updated);
      toast.success("Estado actualizado.");
    } catch (requestError) {
      setError(requestError?.message ?? "No pudimos actualizar el estado.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePriorityChange = async (event) => {
    const priority = event.target.value;
    setIsUpdating(true);
    setError(null);

    try {
      const updated = await updateTaskPriority(task.id, priority);
      onTaskChange?.(updated);
      toast.success("Prioridad actualizada.");
    } catch (requestError) {
      setError(requestError?.message ?? "No pudimos actualizar la prioridad.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);

    try {
      await deleteTask(task.id);
      setIsDialogOpen(false);
      toast.success("Tarea eliminada.");
      router.push("/tasks");
    } catch (requestError) {
      setError(requestError?.message ?? "No pudimos eliminar la tarea.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader
          title="Detalles"
          description="Estado, prioridad e información de la tarea."
          action={
            <Button
              variant="dangerGhost"
              size="sm"
              onClick={() => setIsDialogOpen(true)}
              disabled={isUpdating || isDeleting}
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
              Eliminar
            </Button>
          }
        />

        <CardBody className="space-y-5">
          {error ? <Alert variant="error">{error}</Alert> : null}

          <div className="grid gap-5 sm:grid-cols-2">
            <Select
              id="detail-status"
              name="status"
              label="Estado"
              value={task.status}
              onChange={handleStatusChange}
              options={TASK_STATUS_OPTIONS}
              disabled={isUpdating}
            />

            <Select
              id="detail-priority"
              name="priority"
              label="Prioridad"
              value={task.priority}
              onChange={handlePriorityChange}
              options={TASK_PRIORITY_OPTIONS}
              disabled={isUpdating}
            />
          </div>

          <dl className="grid gap-4 border-t border-[#F1F4F9] pt-5 sm:grid-cols-2">
            <div>
              <dt className="text-[11.5px] font-semibold uppercase tracking-[0.12em] text-[#94A3B8]">
                Proyecto
              </dt>
              <dd className="mt-1.5 flex items-center gap-1.5 text-[13.5px] text-[#334155]">
                <FolderKanban className="h-4 w-4 text-[#94A3B8]" aria-hidden="true" />
                {task.project ?? "General"}
              </dd>
            </div>

            <div>
              <dt className="text-[11.5px] font-semibold uppercase tracking-[0.12em] text-[#94A3B8]">
                Responsable
              </dt>
              <dd className="mt-1.5 flex items-center gap-1.5 text-[13.5px] text-[#334155]">
                <UserRound className="h-4 w-4 text-[#94A3B8]" aria-hidden="true" />
                {task.assignee ?? "Sin asignar"}
              </dd>
            </div>

            <div>
              <dt className="text-[11.5px] font-semibold uppercase tracking-[0.12em] text-[#94A3B8]">
                Vencimiento
              </dt>
              <dd className="mt-1.5 flex items-center gap-1.5 text-[13.5px] text-[#334155]">
                <CalendarDays className="h-4 w-4 text-[#94A3B8]" aria-hidden="true" />
                {task.due_date ? formatDateTime(task.due_date) : "Sin fecha"}
              </dd>
            </div>

            <div>
              <dt className="text-[11.5px] font-semibold uppercase tracking-[0.12em] text-[#94A3B8]">
                Actualizada
              </dt>
              <dd className="mt-1.5 text-[13.5px] text-[#334155]">{formatDateTime(task.updated_at)}</dd>
            </div>
          </dl>

          <div className="flex flex-wrap items-center gap-2 border-t border-[#F1F4F9] pt-5">
            <span className="text-[12px] text-[#94A3B8]">Estado actual:</span>
            <TaskStatusBadge status={task.status} />
            <TaskPriorityBadge priority={task.priority} />
          </div>
        </CardBody>
      </Card>

      <DeleteTaskDialog
        open={isDialogOpen}
        task={task}
        isDeleting={isDeleting}
        onConfirm={handleDelete}
        onClose={() => setIsDialogOpen(false)}
      />
    </>
  );
}
