"use client";

import Link from "next/link";
import { CalendarDays, FolderKanban, UserRound } from "lucide-react";

import { Badge, Skeleton } from "@/components/ui";

import { TaskPriorityBadge, TaskStatusBadge } from "./TaskBadges";

/**
 * Formatea una fecha ISO como dd/mm/aaaa.
 */
function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function TaskSkeletonRows() {
  return Array.from({ length: 5 }).map((_, index) => (
    <tr key={index} className="border-t border-[#F1F4F9]">
      <td className="px-5 py-4">
        <Skeleton className="h-4 w-[220px]" />
      </td>
      <td className="px-5 py-4">
        <Skeleton className="h-5 w-[92px] rounded-full" rounded="rounded-full" />
      </td>
      <td className="px-5 py-4">
        <Skeleton className="h-5 w-[76px] rounded-full" rounded="rounded-full" />
      </td>
      <td className="px-5 py-4">
        <Skeleton className="h-4 w-[120px]" />
      </td>
      <td className="px-5 py-4">
        <Skeleton className="h-4 w-[90px]" />
      </td>
    </tr>
  ));
}

function TaskSkeletonCards() {
  return Array.from({ length: 3 }).map((_, index) => (
    <div key={index} className="rounded-2xl border border-[#E6EBF3] bg-white p-4">
      <Skeleton className="h-4 w-[70%]" />
      <Skeleton className="mt-3 h-5 w-[90px] rounded-full" rounded="rounded-full" />
      <Skeleton className="mt-3 h-3.5 w-[55%]" />
    </div>
  ));
}

/**
 * Listado de tareas.
 *
 * Tabla en escritorio y tarjetas en móvil, con la misma información.
 */
export default function TaskList({ tasks = [], isLoading = false, onSelect }) {
  if (isLoading) {
    return (
      <>
        <div className="hidden overflow-hidden rounded-2xl border border-[#E6EBF3] bg-white md:block">
          <table className="w-full border-collapse">
            <tbody>
              <TaskSkeletonRows />
            </tbody>
          </table>
        </div>

        <div className="grid gap-3 md:hidden">
          <TaskSkeletonCards />
        </div>
      </>
    );
  }

  return (
    <>
      {/* Escritorio */}
      <div className="hidden overflow-hidden rounded-2xl border border-[#E6EBF3] bg-white md:block">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-[#FAFBFD] text-left">
              <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-[#94A3B8]">
                Tarea
              </th>
              <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-[#94A3B8]">
                Estado
              </th>
              <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-[#94A3B8]">
                Prioridad
              </th>
              <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-[#94A3B8]">
                Vencimiento
              </th>
              <th className="px-5 py-3 text-right text-[11px] font-bold uppercase tracking-[0.12em] text-[#94A3B8]">
                Responsable
              </th>
            </tr>
          </thead>

          <tbody>
            {tasks.map((task) => (
              <tr
                key={task.id}
                className="group cursor-pointer border-t border-[#F1F4F9] transition hover:bg-[#FAFBFD]"
                onClick={() => onSelect?.(task)}
              >
                <td className="max-w-[360px] px-5 py-4">
                  <Link
                    href={`/tasks/${task.id}`}
                    onClick={(event) => event.stopPropagation()}
                    className="block truncate text-[13.5px] font-semibold text-[#0B1220] transition hover:text-[#2E6BFF]"
                  >
                    {task.title}
                  </Link>
                  <p className="mt-1 flex items-center gap-1.5 truncate text-[12px] text-[#94A3B8]">
                    <FolderKanban className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    {task.project ?? "General"}
                  </p>
                </td>

                <td className="px-5 py-4">
                  <TaskStatusBadge status={task.status} />
                </td>

                <td className="px-5 py-4">
                  <TaskPriorityBadge priority={task.priority} />
                </td>

                <td className="px-5 py-4">
                  <span className="inline-flex items-center gap-1.5 text-[12.5px] text-[#475569]">
                    <CalendarDays className="h-3.5 w-3.5 text-[#94A3B8]" aria-hidden="true" />
                    {formatDate(task.due_date)}
                  </span>
                </td>

                <td className="px-5 py-4 text-right">
                  <span className="inline-flex items-center gap-1.5 text-[12.5px] text-[#475569]">
                    <UserRound className="h-3.5 w-3.5 text-[#94A3B8]" aria-hidden="true" />
                    {task.assignee ?? "Sin asignar"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Móvil */}
      <div className="grid gap-3 md:hidden">
        {tasks.map((task) => (
          <Link
            key={task.id}
            href={`/tasks/${task.id}`}
            className="rounded-2xl border border-[#E6EBF3] bg-white p-4 transition active:scale-[0.99]"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-[13.5px] font-semibold leading-snug text-[#0B1220]">{task.title}</p>
              <TaskStatusBadge status={task.status} />
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <TaskPriorityBadge priority={task.priority} />
              <Badge tone="neutral">{task.project ?? "General"}</Badge>
            </div>

            <div className="mt-3 flex items-center justify-between gap-3 text-[12px] text-[#94A3B8]">
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
                {formatDate(task.due_date)}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <UserRound className="h-3.5 w-3.5" aria-hidden="true" />
                {task.assignee ?? "Sin asignar"}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
