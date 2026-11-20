"use client";

import { BriefcaseBusiness, CircleCheckBig, Clock3, WalletCards } from "lucide-react";

import { Card, CardBody, Skeleton } from "@/components/ui";

import { formatMoney } from "../utils/format";

function DashboardCard({ icon: Icon, label, value, detail, tone = "neutral" }) {
  const tones = {
    neutral: "bg-[#EFF4FF] text-[#2559E0]",
    danger: "bg-[#FEF4F4] text-[#B42318]",
    success: "bg-[#F0FBF4] text-[#0A6B3D]",
    warning: "bg-[#FEF8EC] text-[#96590A]",
  };

  return (
    <Card>
      <CardBody className="flex items-start gap-3.5">
        <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${tones[tone]}`}>
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#94A3B8]">
            {label}
          </p>
          {value === null ? (
            <Skeleton className="mt-2 h-7 w-24" />
          ) : (
            <p className="mt-1 text-[19px] font-bold tabular-nums tracking-[-0.02em] text-[#0B1220]">
              {value}
            </p>
          )}
          <p className="mt-1 text-[11.5px] leading-4 text-[#64748B]">{detail}</p>
        </div>
      </CardBody>
    </Card>
  );
}

/** Indicadores de deuda, vencimientos y tareas finalizadas con saldo. */
export default function PendingPaymentsDashboard({ stats = null, isLoading = false }) {
  const pendingTotal = stats ? Number(stats.pending_total ?? 0) : null;
  const jobsWithDebt = stats ? Number(stats.jobs_with_debt ?? 0) : null;
  const overdueJobs = stats ? Number(stats.overdue_jobs ?? 0) : null;
  const overdueTotal = stats ? Number(stats.overdue_total ?? 0) : null;
  const completedWithDebt = stats ? Number(stats.completed_jobs_with_debt ?? 0) : null;

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <DashboardCard
        icon={WalletCards}
        label="Saldo por cobrar"
        value={isLoading ? null : formatMoney(pendingTotal)}
        detail="Total pendiente en los resultados filtrados"
      />
      <DashboardCard
        icon={BriefcaseBusiness}
        label="Trabajos con deuda"
        value={isLoading ? null : jobsWithDebt}
        detail="Incluye trabajos activos y finalizados"
        tone="warning"
      />
      <DashboardCard
        icon={Clock3}
        label="Trabajos vencidos"
        value={isLoading ? null : overdueJobs}
        detail={
          isLoading
            ? "Consultando vencimientos"
            : `${formatMoney(overdueTotal)} associated a trabajos vencidos`
        }
        tone="danger"
      />
      <DashboardCard
        icon={CircleCheckBig}
        label="Finalizados con saldo"
        value={isLoading ? null : completedWithDebt}
        detail="Finalizar una tarea no cancela su deuda"
        tone="success"
      />
    </div>
  );
}
