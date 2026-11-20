"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, LoaderCircle, Pencil } from "lucide-react";

import { Alert, Button, Card, CardBody, CardFooter, CardHeader, PageHeader } from "@/components/ui";

import { useTask } from "../hooks/useTask";
import { useTaskForm } from "../hooks/useTaskForm";
import { formatDateTime, getAssigneeLabel, toDateInputValue } from "../utils/format";
import TaskDetail from "./TaskDetail";
import TaskForm from "./TaskForm";

/** Detalle de una tarea: edición de campos, estado operativo y financials. */
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
            priority: task.priority ?? "medium",
            due_date: toDateInputValue(task.due_date),
            customer_id: task.customer_id ?? "",
            total_price:
              task.total_price === null || task.total_price === undefined
                ? ""
                : String(task.total_price),
          }
        : {},
    [task],
  );

  const form = useTaskForm({
    initialValues,
    taskId,
    totalPaid: task?.total_paid ?? 0,
  });

  const setFormValues = form.setValues;

  useEffect(() => {
    if (task) setFormValues(initialValues);
  }, [initialValues, setFormValues, task]);

  const handleSave = async () => {
    const saved = await form.submitTask();

    if (saved) {
      setTask(saved);
      setIsEditing(false);
    }
  };

  function handleCancelEdit() {
    form.setValues(initialValues);
    setIsEditing(false);
  }

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
        description={`${task.customer_name || "Sin cliente"} · ${getAssigneeLabel(task)}`}
        actions={
          <>
            <Button variant="outline" onClick={() => router.push("/tasks")}>
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Volver
            </Button>

            <Button
              variant={isEditing ? "ghost" : "primary"}
              onClick={() => (isEditing ? handleCancelEdit() : setIsEditing(true))}
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

      <Card>
        <CardHeader
          title={isEditing ? "Editar tarea" : "Descripción"}
          description={
            isEditing
              ? "Actualiza los campos editables y guarda los cambios."
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
              totalPaid={task.total_paid ?? 0}
              pendingBalance={task.pending_balance ?? 0}
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
                  <dd className="mt-1 text-[13px] text-[#334155]">
                    {formatDateTime(task.created_at)}
                  </dd>
                </div>

                <div>
                  <dt className="text-[11.5px] font-semibold uppercase tracking-[0.12em] text-[#94A3B8]">
                    Identificador
                  </dt>
                  <dd className="mt-1 break-all font-mono text-[12.5px] text-[#64748B]">
                    {task.id}
                  </dd>
                </div>
              </dl>
            </div>
          )}
        </CardBody>

        {isEditing ? (
          <CardFooter>
            <Button variant="outline" onClick={handleCancelEdit} disabled={form.isLoading}>
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
  );
}
