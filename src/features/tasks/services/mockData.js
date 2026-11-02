/**
 * Datos ficticios para la vista previa del módulo de tareas.
 *
 * ⚠️ No provienen del backend: son de ejemplo y solo existen en memoria
 * mientras la aplicación está abierta. Se sustituyen cuando conectes
 * `GET /api/v1/tasks/`.
 */

export const MOCK_TASKS = [
  {
    id: "task_001",
    title: "Revisión de la hoja de ruta del Q4",
    description:
      "Alinear prioridades con el equipo comercial y cerrar el calendario de entregables del último trimestre.",
    status: "in_progress",
    priority: "high",
    due_date: "2026-11-08",
    project: "Planificación",
    assignee: "Ana Morales",
    created_at: "2026-10-28T09:12:00Z",
    updated_at: "2026-10-31T08:45:00Z",
  },
  {
    id: "task_002",
    title: "Preparar el lanzamiento de la nueva versión",
    description:
      "Coordinar notas de prensa, formación del equipo de soporte y checklist de despliegue en staging.",
    status: "todo",
    priority: "urgent",
    due_date: "2026-11-03",
    project: "Marketing",
    assignee: "Carlos Ruiz",
    created_at: "2026-10-27T16:40:00Z",
    updated_at: "2026-10-30T17:05:00Z",
  },
  {
    id: "task_003",
    title: "Informe mensual de rendimiento",
    description:
      "Consolidar métricas de productividad, coste por proyecto y cumplimiento de objetivos por equipo.",
    status: "review",
    priority: "medium",
    due_date: "2026-11-12",
    project: "Finanzas",
    assignee: "Diana Peña",
    created_at: "2026-10-25T11:05:00Z",
    updated_at: "2026-10-31T10:22:00Z",
  },
  {
    id: "task_004",
    title: "Auditar permisos del espacio de trabajo",
    description:
      "Revisar roles activos y eliminar accesos de cuentas que ya no collaborates en el equipo.",
    status: "blocked",
    priority: "high",
    due_date: "2026-11-01",
    project: "Seguridad",
    assignee: "Marcos Medina",
    created_at: "2026-10-24T08:30:00Z",
    updated_at: "2026-10-29T13:15:00Z",
  },
  {
    id: "task_005",
    title: "Migrar automatizaciones al nuevo motor",
    description:
      "Portar los flujos críticos al motor v2 y verificar que no haya tareas duplicadas en la cola.",
    status: "done",
    priority: "medium",
    due_date: "2026-10-29",
    project: "Operaciones",
    assignee: "Ana Morales",
    created_at: "2026-10-18T10:00:00Z",
    updated_at: "2026-10-29T19:40:00Z",
  },
  {
    id: "task_006",
    title: "Definir objetivos del próximo trimestre",
    description:
      "Traducir los resultados esperados del negocio en métricas medibles por equipo y por cliente.",
    status: "todo",
    priority: "low",
    due_date: "2026-11-20",
    project: "Planificación",
    assignee: "Carlos Ruiz",
    created_at: "2026-10-30T09:00:00Z",
    updated_at: "2026-10-30T09:00:00Z",
  },
  {
    id: "task_007",
    title: "Configurar notificaciones de resumen diario",
    description:
      "Enviar un resumen automático cada mañana con tareas vencidas, asignadas y en revisión.",
    status: "done",
    priority: "low",
    due_date: "2026-10-27",
    project: "Operaciones",
    assignee: "Diana Peña",
    created_at: "2026-10-22T12:45:00Z",
    updated_at: "2026-10-27T07:50:00Z",
  },
  {
    id: "task_008",
    title: "Documentar el proceso de onboarding",
    description:
      "Escribir elrunbook de altas de clientes con responsables, tiempos y puntos de control.",
    status: "in_progress",
    priority: "medium",
    due_date: "2026-11-15",
    project: "Customer Success",
    assignee: "Marcos Medina",
    created_at: "2026-10-29T14:20:00Z",
    updated_at: "2026-10-31T09:05:00Z",
  },
];

/** Resumen ficticio para el dashboard. */
export const MOCK_STATS = {
  total: MOCK_TASKS.length,
  in_progress: MOCK_TASKS.filter((task) => task.status === "in_progress").length,
  completed: MOCK_TASKS.filter((task) => task.status === "done").length,
  overdue: 2,
  completion_rate: 62,
};
