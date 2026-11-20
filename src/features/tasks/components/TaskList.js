"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  CircleDollarSign,
  Clock3,
  Phone,
  UserRound,
  WalletCards,
} from "lucide-react";

import { Badge, Button, Skeleton } from "@/components/ui";

import { formatDate, formatMoney, getAssigneeLabel, isTaskOverdue, summarizeDescription } from "../utils/format";
import { TaskPaymentBadge, TaskPriorityBadge, TaskStatusBadge } from "./TaskBadges";
import TaskPaymentModal from "./TaskPaymentModal";

function TaskSkeletonCards() {
  return Array.from({ length: 6 }).map((_, index) => (
    <div key={index} className="rounded-2xl border border-[#E6EBF3] bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <Skeleton className="h-4 w-[72%]" />
        <Skeleton className="h-5 w-24 rounded-full" rounded="rounded-full" />
      </div>
      <Skeleton className="mt-4 h-3.5 w-[90%]" />
      <Skeleton className="mt-2 h-3.5 w-[62%]" />
      <div className="mt-5 grid grid-cols-3 gap-3 border-t border-[#EEF1F6] pt-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    </div>
  ));
}

function TaskCard({ task, onPayment }) {
  const overdue = isTaskOverdue(task);
  const pendingBalance = Number(task.pending_balance ?? 0);
  const hasPrice = task.total_price !== null && task.total_price !== undefined;

  return (
    <article className="flex min-h-[310px] flex-col rounded-2xl border border-[#E6EBF3] bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition hover:border-[#CBD5E1] hover:shadow-[0_12px_30px_-22px_rgba(15,23,42,0.28)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Link
            href={`/tasks/${task.id}`}
            className="block text-[14px] font-semibold leading-5 text-[#0B1220] transition hover:text-[#2559E0]"
          >
            {task.title}
          </Link>
          <p className="mt-1.5 text-[12px] leading-5 text-[#64748B]">
            {summarizeDescription(task.description, 110) || "Sin descripción"}
          </p>
        </div>
        <TaskStatusBadge status={task.status} className="shrink-0" />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <TaskPriorityBadge priority={task.priority} />
        <TaskPaymentBadge status={task.payment_status} totalPrice={task.total_price} />
        {overdue ? <Badge tone="danger">Vencida</Badge> : null}
      </div>

      <dl className="mt-4 grid gap-3 border-y border-[#EEF1F6] py-4 text-[12.5px] sm:grid-cols-2">
        <div className="min-w-0">
          <dt className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#94A3B8]">
            <UserRound className="h-3.5 w-3.5" aria-hidden="true" />
            Cliente
          </dt>
          <dd className="mt-1 truncate font-medium text-[#334155]">
            {task.customer_name || "Sin cliente"}
          </dd>
          {task.customer_phone ? (
            <p className="mt-0.5 flex items-center gap-1 truncate text-[11.5px] text-[#94A3B8]">
              <Phone className="h-3 w-3 shrink-0" aria-hidden="true" />
              {task.customer_phone}
            </p>
          ) : null}
        </div>

        <div className="min-w-0">
          <dt className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#94A3B8]">
            <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
            Vencimiento
          </dt>
          <dd className={`mt-1 font-medium ${overdue ? "text-[#B42318]" : "text-[#334155]"}`}>
            {task.due_date ? formatDate(task.due_date) : "Sin fecha"}
          </dd>
          <p className="mt-0.5 flex items-center gap-1 truncate text-[11.5px] text-[#94A3B8]">
            <UserRound className="h-3 w-3 shrink-0" aria-hidden="true" />
            {getAssigneeLabel(task)}
          </p>
        </div>
      </dl>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <div>
          <p className="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-[#94A3B8]">
            Precio
          </p>
          <p className="mt-1 text-[12.5px] font-semibold tabular-nums text-[#334155]">
            {hasPrice ? formatMoney(task.total_price) : "Sin precio"}
          </p>
        </div>
        <div>
          <p className="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-[#94A3B8]">
            Abonado
          </p>
          <p className="mt-1 text-[12.5px] font-semibold tabular-nums text-[#0A6B3D]">
            {formatMoney(task.total_paid)}
          </p>
        </div>
        <div>
          <p className="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-[#94A3B8]">
            Saldo
          </p>
          <p
            className={`mt-1 text-[12.5px] font-semibold tabular-nums ${
              pendingBalance > 0 ? "text-[#B42318]" : "text-[#0A6B3D]"
            }`}
          >
            {formatMoney(pendingBalance)}
          </p>
        </div>
      </div>

      <div className="mt-auto flex items-center justify-between gap-3 pt-5">
        <span className="inline-flex items-center gap-1.5 text-[11.5px] text-[#94A3B8]">
          {pendingBalance > 0 ? (
            <Clock3 className="h-3.5 w-3.5 text-[#B42318]" aria-hidden="true" />
          ) : (
            <CircleDollarSign className="h-3.5 w-3.5 text-[#0A6B3D]" aria-hidden="true" />
          )}
          {pendingBalance > 0 ? "Saldo pendiente" : "Sin saldo pendiente"}
        </span>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPayment?.(task)}
          disabled={pendingBalance <= 0}
        >
          <WalletCards className="h-3.5 w-3.5" aria-hidden="true" />
          Registrar abono
        </Button>
      </div>
    </article>
  );
}

/** Listado de tareas en tarjetas, tanto en escritorio como en móvil. */
export default function TaskList({ tasks = [], isLoading = false, onSelect }) {
  const [paymentTask, setPaymentTask] = useState(null);

  function handlePayment(task) {
    onSelect?.(task);
    setPaymentTask(task);
  }

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <TaskSkeletonCards />
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} onPayment={handlePayment} />
        ))}
      </div>

      <TaskPaymentModal
        open={Boolean(paymentTask)}
        task={paymentTask}
        onClose={() => setPaymentTask(null)}
      />
    </>
  );
}
