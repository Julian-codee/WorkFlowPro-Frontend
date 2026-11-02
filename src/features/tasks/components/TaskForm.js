"use client";

import { Alert, Input, Select, Textarea } from "@/components/ui";

import { TASK_PRIORITY_OPTIONS, TASK_STATUS_OPTIONS } from "../constants";

/**
 * Formulario de alta/edición de tarea.
 *
 * Todos los campos controlados y con validación visual.
 * `onSubmit` recibe los valores ya validados.
 */
export default function TaskForm({ values, errors, onChange, onBlur, onSubmit, isLoading, isEditing }) {
  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit?.();
      }}
      className="space-y-5"
    >
      <Input
        id="task-title"
        name="title"
        label="Título"
        placeholder="Ej. Revisión de la hoja de ruta del Q4"
        value={values.title}
        onChange={onChange}
        onBlur={onBlur}
        error={errors.title}
        disabled={isLoading}
        required
      />

      <Textarea
        id="task-description"
        name="description"
        label="Descripción"
        placeholder="Contexto, alcance y criterios de aceptación"
        value={values.description}
        onChange={onChange}
        onBlur={onBlur}
        error={errors.description}
        maxLength={1000}
        rows={5}
        disabled={isLoading}
        hint="Opcional. Máximo 1000 caracteres."
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <Select
          id="task-status"
          name="status"
          label="Estado"
          value={values.status}
          onChange={onChange}
          options={TASK_STATUS_OPTIONS}
          disabled={isLoading}
        />

        <Select
          id="task-priority"
          name="priority"
          label="Prioridad"
          value={values.priority}
          onChange={onChange}
          options={TASK_PRIORITY_OPTIONS}
          disabled={isLoading}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Input
          id="task-due-date"
          name="due_date"
          type="date"
          label="Fecha de vencimiento"
          value={values.due_date ?? ""}
          onChange={onChange}
          onBlur={onBlur}
          error={errors.due_date}
          disabled={isLoading}
        />

        <Input
          id="task-project"
          name="project"
          label="Proyecto"
          placeholder="Ej. Marketing"
          value={values.project ?? ""}
          onChange={onChange}
          onBlur={onBlur}
          disabled={isLoading}
        />
      </div>

      <Input
        id="task-assignee"
        name="assignee"
        label="Responsable"
        placeholder="Nombre de la persona asignada"
        value={values.assignee ?? ""}
        onChange={onChange}
        onBlur={onBlur}
        disabled={isLoading}
        hint="En la integración real, este campo se irresuelve con el listado de usuarios del tenant."
      />

      {errors.title ? (
        <Alert variant="error">Revisa los campos marcados antes de guardar la tarea.</Alert>
      ) : null}
    </form>
  );
}
