"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  CircleDot,
  ListTodo,
  Plus,
  TrendingUp,
} from "lucide-react";

import { Alert, Button, Card, CardBody, CardHeader, PageHeader, Skeleton } from "@/components/ui";
import { useSession } from "@/features/auth/hooks/useSession";
import { TaskStatusBadge } from "@/features/tasks/components/TaskBadges";
import { useTasks } from "@/features/tasks/hooks/useTasks";

/**
 * Dashboard: resumen de actividad y tareas recientes.
 */
export default function DashboardView() {
  const router = useRouter();
  const { user } = useSession();

  const { tasks, stats, isLoading, error } = useTasks({ pageSize: 5 });

  const firstName = (user?.full_name ?? "").split(" ")[0] || "";

  const kpis = [
    {
      label: "Tareas totales",
      value: stats?.total ?? 0,
      icon: ListTodo,
      tone: "bg-[#EFF4FF] text-[#2E6BFF]",
    },
    {
      label: "En curso",
      value: stats?.in_progress ?? 0,
      icon: CircleDot,
      tone: "bg-[#F7F4FF] text-[#6941C6]",
    },
    {
      label: "Completadas",
      value: stats?.completed ?? 0,
      icon: CheckCircle2,
      tone: "bg-[#F0FBF4] text-[#12A150]",
    },
    {
      label: "Vencidas",
      value: stats?.overdue ?? 0,
      icon: CalendarClock,
      tone: "bg-[#FEF4F4] text-[#D92D20]",
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Resumen"
        title={firstName ? `Hola, ${firstName}` : "Dashboard"}
        description="Vista general de tu espacio de trabajo: qué avanza, qué bloquea y qué toca hoy."
        actions={
          <>
            <Button variant="outline" href="/tasks">
              Ver todas las tareas
            </Button>
            <Button variant="brand" onClick={() => router.push("/tasks/new")}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              Nueva tarea
            </Button>
          </>
        }
      />

      {error ? <Alert variant="error">{error}</Alert> : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;

          return (
            <Card key={kpi.label} className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[12.5px] font-medium text-[#64748B]">{kpi.label}</p>

                  {isLoading ? (
                    <Skeleton className="mt-2.5 h-7 w-12" />
                  ) : (
                    <p className="mt-1 text-[26px] font-bold leading-none tracking-[-0.02em] text-[#0B1220]">
                      {kpi.value}
                    </p>
                  )}
                </div>

                <span className={`grid h-10 w-10 place-items-center rounded-xl ${kpi.tone}`}>
                  <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
                </span>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <Card>
          <CardHeader
            title="Tareas recientes"
            description="Lo último que se ha movido en el equipo."
            action={
              <Link
                href="/tasks"
                className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-[#2E6BFF] transition hover:text-[#1D4FD8]"
              >
                Ver todas
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            }
          />

          <CardBody className="pt-4">
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <Skeleton className="h-4 flex-1" />
                    <Skeleton className="h-5 w-20 rounded-full" rounded="rounded-full" />
                  </div>
                ))}
              </div>
            ) : tasks.length === 0 ? (
              <p className="py-6 text-center text-[13px] text-[#94A3B8]">
                Todavía no hay tareas. Crea la primera para empezar.
              </p>
            ) : (
              <ul className="divide-y divide-[#F1F4F9]">
                {tasks.map((task) => (
                  <li key={task.id} className="flex items-center gap-4 py-3">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#F7F9FC] text-[#94A3B8]">
                      <ListTodo className="h-4 w-4" aria-hidden="true" />
                    </span>

                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/tasks/${task.id}`}
                        className="block truncate text-[13.5px] font-medium text-[#0B1220] transition hover:text-[#2E6BFF]"
                      >
                        {task.title}
                      </Link>
                      <p className="truncate text-[12px] text-[#94A3B8]">
                        {task.project ?? "General"} · {task.assignee ?? "Sin asignar"}
                      </p>
                    </div>

                    <TaskStatusBadge status={task.status} />
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Rendimiento" description="Objetivo semanal del equipo." />

            <CardBody className="pt-4">
              <div className="flex items-end justify-between gap-3">
                <p className="text-[32px] font-bold leading-none tracking-[-0.03em] text-[#0B1220]">
                  {stats?.completion_rate ?? 0}%
                </p>
                <span className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-[#12A150]">
                  <TrendingUp className="h-3.5 w-3.5" aria-hidden="true" />
                  +8% esta semana
                </span>
              </div>

              <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-[#EEF1F6]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#2E6BFF] to-[#60A5FA]"
                  style={{ width: `${stats?.completion_rate ?? 0}%` }}
                />
              </div>

              <p className="mt-3 text-[12.5px] leading-5 text-[#64748B]">
                Las tareas completadas representan el porcentaje de avance del plan actual.
              </p>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Acciones rápidas" />

            <CardBody className="space-y-2 pt-4">
              <Button variant="outline" className="w-full justify-start" href="/tasks/new">
                <Plus className="h-4 w-4" aria-hidden="true" />
                Crear una tarea
              </Button>

              <Button variant="outline" className="w-full justify-start" href="/tasks">
                <ListTodo className="h-4 w-4" aria-hidden="true" />
                Revisar el backlog
              </Button>

              <Button variant="outline" className="w-full justify-start" href="/settings/profile">
                <CalendarClock className="h-4 w-4" aria-hidden="true" />
                Actualizar mi perfil
              </Button>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
