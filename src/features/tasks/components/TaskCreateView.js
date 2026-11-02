"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Check, LoaderCircle } from "lucide-react";

import { Alert, Button, Card, CardBody, CardFooter, CardHeader, PageHeader } from "@/components/ui";

import TaskForm from "./TaskForm";
import { useTaskForm } from "../hooks/useTaskForm";

/**
 * Pantalla de alta de tarea.
 *
 * El guardado llama a `createTask` (preparado para `POST /tasks/`).
 */
export default function TaskCreateView() {
  const router = useRouter();

  const {
    values,
    errors,
    formError,
    notice,
    isLoading,
    handleChange,
    handleBlur,
    submitTask,
  } = useTaskForm();

  const handleSubmit = async () => {
    const saved = await submitTask();

    if (saved) {
      router.push(`/tasks/${saved.id}`);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        eyebrow="Nueva tarea"
        title="Crear una tarea"
        description="Define el trabajo, asigna prioridad y fecha para que el equipo sepa qué toca."
        actions={
          <Button variant="outline" onClick={() => router.push("/tasks")}>
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Volver
          </Button>
        }
      />

      {formError ? <Alert variant="error">{formError}</Alert> : null}
      {notice ? <Alert variant="success">{notice}</Alert> : null}

      <Card>
        <CardHeader title="Detalles de la tarea" />

        <CardBody>
          <TaskForm
            values={values}
            errors={errors}
            onChange={handleChange}
            onBlur={handleBlur}
            onSubmit={handleSubmit}
            isLoading={isLoading}
            isEditing={false}
          />
        </CardBody>

        <CardFooter>
          <Button variant="outline" onClick={() => router.push("/tasks")} disabled={isLoading}>
            Cancelar
          </Button>

          <Button loading={isLoading} disabled={isLoading} onClick={handleSubmit}>
            {isLoading ? (
              <>
                <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
                Guardando…
              </>
            ) : (
              <>
                <Check className="h-4 w-4" aria-hidden="true" />
                Crear tarea
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
