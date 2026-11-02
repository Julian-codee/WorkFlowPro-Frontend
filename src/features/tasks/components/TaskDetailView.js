"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, LoaderCircle, Pencil } from "lucide-react";

import { Alert, Button, Card, CardBody, CardFooter, CardHeader, PageHeader } from "@/components/ui";

import TaskDetail from "./TaskDetail";
import TaskForm from "./TaskForm";
import { useTask } from "../hooks/useTask";
import { useTaskForm } from "../hooks/useTaskForm";

/**
 * Detalle de una tarea: edición de campos + panel de acciones rápidas.
 *
 * Carga con `GET /tasks/{id}` y guarda con `PATCH /tasks/{id}`.
 */
export default function TaskDetailView({ taskId }) {
  const router = useRouter();
  const { task, status, error, isLoading, setTask } = useTask(taskId);

  const [isEditing, setIsEditing] = useState(false);

  const initialValues = useMemo(
    () =>
      task
        ? {
            title: task.title ?? "",
            description: task.description ?? "",
            status: task.status ?? "todo",
            priority: task.priority ?? "medium",
            due_date: task.due_date ?? "",
            project: task.project ?? "",
            assignee: task.assignee ?? "",
          }
        : {},
    [task],
  );

  const form = useTaskForm({ initialValues, taskId });

  useEffect(() => {
    if (task) form.setValues(initialValues);
    // Solo se sincroniza cuando llega la tarea desde el servidor.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [task]);

  const handleSave = async () => {
    const saved = await form.submitTask();

    if (saved) {
      setTask(saved);
      setIsEditing(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="space-y-6">
        <PageHeader title="Tarea" description="Cargando la información de la tarea…" />
      </div>
    );
  }

  if (status === "error" || !task) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <Alert variant="error">{error ?? "No encontramos la tarea solicitada."}</Alert>

        <Button variant="outline" onClick={() => router.push("/tasks")}>
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Volver al listado
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Detalle"
        title={task.title}
        description={`${task.project ?? "General"} · ${task.assignee ?? "Sin asignar"}`}
        actions={
          <>
            <Button variant="outline" onClick={() => router.push("/tasks")}>
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Volver
            </Button>

            <Button
              variant={isEditing ? "ghost" : "primary"}
              onClick={() => setIsEditing((current) => !current)}
              disabled={form.isLoading}
            >
              <Pencil className="h-4 w-4" aria-hidden="true" />
              {isEditing ? "Cancelar edición" : "Editar tarea"}
            </Button>
          </>
        }
      />

      {form.formError ? <Alert variant="error">{form.formError}</Alert> : null}
      {form.notice ? <Alert variant="success">{form.notice}</Alert> : null}

      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <Card>
          <CardHeader
            title={isEditing ? "Editar tarea" : "Descripción"}
            description={
              isEditing
                ? "Actualiza los campos y guarda los cambios."
                : "Contexto y alcance de la tarea."
            }
          />

          <CardBody>
            {isEditing ? (
              <TaskForm
                values={form.values}
                errors={form.errors}
                onChange={form.handleChange}
                onBlur={form.handleBlur}
                onSubmit={handleSave}
                isLoading={form.isLoading}
                isEditing
              />
            ) : (
              <div className="space-y-4">
                <p className="whitespace-pre-line text-[13.5px] leading-6 text-[#475569]">
                  {task.description || "Esta tarea todavía no tiene descripción."}
                </p>

                <dl className="grid gap-4 border-t border-[#F1F4F9] pt-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-[11.5px] font-semibold uppercase tracking-[0.12em] text-[#94A3B8]">
                      Creada
                    </dt>
                    <dd className="mt-1 text-[13px] text-[#334155]">{formatDate(task.created_at)}</dd>
                  </div>

                  <div>
                    <dt className="text-[11.5px] font-semibold uppercase tracking-[0.12em] text-[#94A3B8]">
                      Identificador
                    </dt>
                    <dd className="mt-1 font-mono text-[12.5px] text-[#64748B]">{task.id}</dd>
                  </div>
                </dl>
              </div>
            )}
          </CardBody>

          {isEditing ? (
            <CardFooter>
              <Button variant="outline" onClick={() => setIsEditing(false)} disabled={form.isLoading}>
                Cancelar
              </Button>

              <Button loading={form.isLoading} disabled={form.isLoading} onClick={handleSave}>
                {form.isLoading ? (
                  <>
                    <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
                    Guardando…
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" aria-hidden="true" />
                    Guardar cambios
                  </>
                )}
              </Button>
            </CardFooter>
          ) : null}
        </Card>

        <TaskDetail task={task} onTaskChange={setTask} />
      </div>
    </div>
  );
}

function formatDate(value) {
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
