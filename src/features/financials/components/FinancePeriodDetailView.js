"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Banknote,
  CalendarClock,
  ClipboardList,
  LockKeyhole,
  ReceiptText,
  Scale,
  WalletCards,
} from "lucide-react";

import {
  Alert,
  Button,
  Card,
  CardBody,
  CardHeader,
  EmptyState,
  PageHeader,
  useToast,
} from "@/components/ui";

import { MOVEMENT_TYPES, PERIOD_STATUSES, getCategoryLabel } from "../constants";
import { useFinancialPeriod } from "../hooks/useFinancialPeriod";
import {
  closePeriod,
  confirmClosure,
  createClosure,
  updateClosure,
} from "../services/financialService";
import { formatDate, formatDateTime, formatMoney, formatWeekRange } from "../utils/format";
import { ClosureStatusBadge, MovementTypeBadge, PeriodStatusBadge } from "./FinanceBadges";
import { ClosePeriodDialog } from "./FinanceClosureDialogs";
import FinanceKpiCard from "./FinanceKpiCard";

function getDifferenceTone(value) {
  if (Number(value) > 0) return "text-[#0A6B3D]";
  if (Number(value) < 0) return "text-[#B42318]";
  return "text-[#64748B]";
}

function formatDifference(value) {
  const amount = Number(value ?? 0);
  const prefix = amount > 0 ? "+" : amount < 0 ? "−" : "";

  return `${prefix}${formatMoney(Math.abs(amount))}`;
}

function formatMovementAmount(movement) {
  const amount = Number(movement?.amount ?? 0);
  const prefix = movement?.type === MOVEMENT_TYPES.INCOME ? "+" : "−";

  return `${prefix}${formatMoney(Math.abs(amount))}`;
}

/**
 * Detalle de un período semanal con sus movimientos, acumuladores y cierre.
 */
export default function FinancePeriodDetailView({ periodId }) {
  const router = useRouter();
  const toast = useToast();
  const { period, totals, movements, closure, status, error, isLoading, reload } =
    useFinancialPeriod(periodId);

  const [isCloseDialogOpen, setIsCloseDialogOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  async function handleConfirmClose(payload) {
    if (!period) return;

    setIsClosing(true);

    const expectedCash =
      Number(period.opening_balance ?? 0) +
      Number(period.cash_balance ?? period.balance ?? 0);
    const closurePayload = {
      period_id: period.id,
      expected_cash: expectedCash,
      actual_cash: payload.actual_cash,
      responsible: payload.responsible,
      notes: payload.notes,
      observations: payload.notes,
    };

    try {
      const savedClosure = closure
        ? await updateClosure(closure.id, closurePayload)
        : await createClosure(closurePayload);

      await confirmClosure(savedClosure.id, {
        actual_cash: payload.actual_cash,
        expected_cash: expectedCash,
        notes: payload.notes,
        observations: payload.notes,
      });
      await closePeriod(period.id, { closed_by: payload.responsible });

      setIsCloseDialogOpen(false);
      toast.success("Semana cerrada correctamente.");
      reload();
    } catch (requestError) {
      toast.error(requestError?.message ?? "No pudimos cerrar la semana.");
    } finally {
      setIsClosing(false);
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Cargando…" description="Preparando el detalle del período semanal." />
      </div>
    );
  }

  if (status === "error" || !period) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <Alert variant="error">{error ?? "No encontramos el período solicitado."}</Alert>

        <Button variant="outline" onClick={() => router.push("/financials/periods")}>
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Volver
        </Button>
      </div>
    );
  }

  const expectedCash =
    Number(period.opening_balance ?? 0) + Number(period.cash_balance ?? period.balance ?? 0);
  const weekIncome = Number(totals?.income ?? period.income ?? 0);
  const weekExpense = Number(totals?.expense ?? period.expense ?? 0);
  const weekBalance = Number(totals?.balance ?? period.balance ?? 0);
  const cashIncome = Number(totals?.cash_income ?? period.cash_income ?? 0);
  const cashExpense = Number(totals?.cash_expense ?? period.cash_expense ?? 0);
  const cashBalance = Number(totals?.cash_balance ?? period.cash_balance ?? 0);
  const movementCount = Number(totals?.count ?? period.movement_count ?? 0);

  const accumulators = [
    {
      label: "Ingresos de la semana",
      value: formatMoney(weekIncome),
      icon: Banknote,
      tone: "bg-[#F0FBF4] text-[#0A6B3D]",
    },
    {
      label: "Egresos de la semana",
      value: formatMoney(weekExpense),
      icon: ReceiptText,
      tone: "bg-[#FEF4F4] text-[#B42318]",
    },
    {
      label: "Balance de la semana",
      value: (
        <span className={weekBalance >= 0 ? "text-[#0A6B3D]" : "text-[#B42318]"}>
          {formatMoney(weekBalance)}
        </span>
      ),
      icon: Scale,
      tone: "bg-[#EFF4FF] text-[#2E6BFF]",
    },
    {
      label: "Saldo de apertura",
      value: formatMoney(period.opening_balance ?? 0),
      icon: WalletCards,
      tone: "bg-[#F1F5F9] text-[#475569]",
    },
    {
      label: "N.º de movimientos",
      value: movementCount,
      icon: ClipboardList,
      tone: "bg-[#F7F4FF] text-[#6941C6]",
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Período semanal"
        title={`Semana ${period.number}`}
        description={formatWeekRange(period.start_date, period.end_date)}
        actions={
          <>
            <Button variant="outline" onClick={() => router.push("/financials/periods")}>
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Volver
            </Button>

            {period.status === PERIOD_STATUSES.OPEN ? (
              <Button variant="brand" onClick={() => setIsCloseDialogOpen(true)}>
                <LockKeyhole className="h-4 w-4" aria-hidden="true" />
                Cerrar semana
              </Button>
            ) : null}
          </>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <PeriodStatusBadge status={period.status} />

        <span className="inline-flex items-center gap-1.5 rounded-full border border-[#E2E8F0] bg-white px-2.5 py-1 text-[11.5px] font-medium text-[#475569]">
          <CalendarClock className="h-3.5 w-3.5 text-[#2E6BFF]" aria-hidden="true" />
          Acumuladores reiniciados el lunes
        </span>
      </div>

      {period.status === PERIOD_STATUSES.OPEN ? (
        <Alert variant="info" title="El período aún está abierto">
          Al cerrar la semana se congela el conteo y los movimientos posteriores se registran como
          tardíos con su justificación.
        </Alert>
      ) : null}

      <section aria-labelledby="period-accumulators-title">
        <h2 id="period-accumulators-title" className="sr-only">
          Acumuladores de la semana
        </h2>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {accumulators.map((accumulator) => {
            const Icon = accumulator.icon;

            return (
              <FinanceKpiCard
                key={accumulator.label}
                label={accumulator.label}
                value={accumulator.value}
                icon={Icon}
                tone={accumulator.tone}
              />
            );
          })}
        </div>

        <p className="mt-3 text-[12px] leading-5 text-[#64748B]">
          Los acumuladores se reinician cada lunes; el saldo y el historial se conservan.
        </p>
      </section>

      <Card>
        <CardHeader
          title="Movimientos de la semana"
          description="Ingresos y egresos registrados entre el lunes y el domingo."
        />
        <CardBody className="p-0">
          {movements.length === 0 ? (
            <EmptyState
              icon={ClipboardList}
              title="No hay movimientos en esta semana"
              description="Los movimientos registrados durante el período aparecerán aquí."
              className="m-5 border-0 bg-transparent"
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] border-collapse">
                <thead>
                  <tr className="bg-[#FAFBFD] text-left">
                    <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-[#94A3B8]">
                      Fecha
                    </th>
                    <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-[#94A3B8]">
                      Concepto
                    </th>
                    <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-[#94A3B8]">
                      Tipo
                    </th>
                    <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-[#94A3B8]">
                      Categoría
                    </th>
                    <th className="px-5 py-3 text-right text-[11px] font-bold uppercase tracking-[0.12em] text-[#94A3B8]">
                      Importe
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {movements.map((movement) => (
                    <tr key={movement.id} className="border-t border-[#F1F4F9] transition hover:bg-[#FAFBFD]">
                      <td className="whitespace-nowrap px-5 py-4 text-[12.5px] font-medium text-[#475569]">
                        {formatDate(movement.movement_date)}
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-[13px] font-semibold text-[#0B1220]">{movement.concept}</p>
                        {movement.reference ? (
                          <p className="mt-0.5 text-[11.5px] text-[#94A3B8]">{movement.reference}</p>
                        ) : null}
                      </td>
                      <td className="px-5 py-4">
                        <MovementTypeBadge type={movement.type} />
                      </td>
                      <td className="px-5 py-4 text-[12.5px] text-[#475569]">
                        {getCategoryLabel(movement.category)}
                      </td>
                      <td
                        className={`whitespace-nowrap px-5 py-4 text-right text-[13.5px] font-semibold tabular-nums ${
                          movement.type === MOVEMENT_TYPES.INCOME ? "text-[#0A6B3D]" : "text-[#B42318]"
                        }`}
                      >
                        {formatMovementAmount(movement)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="Revisión de caja"
          description="Saldo esperado, movimientos de la semana y resultado del cierre asociado."
        />
        <CardBody className="pt-6">
          <div className="grid gap-5 lg:grid-cols-[1fr_1.15fr]">
            <dl className="space-y-3 rounded-xl border border-[#EEF1F6] bg-[#FAFBFD] p-4">
              <div className="flex items-center justify-between gap-4">
                <dt className="text-[12.5px] font-medium text-[#64748B]">Saldo esperado</dt>
                <dd className="text-[13.5px] font-bold tabular-nums text-[#0B1220]">
                  {formatMoney(expectedCash)}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-[12.5px] font-medium text-[#64748B]">Ingresos en caja</dt>
                <dd className="text-[13.5px] font-semibold tabular-nums text-[#0A6B3D]">
                  {formatMoney(cashIncome)}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-[12.5px] font-medium text-[#64748B]">Egresos en caja</dt>
                <dd className="text-[13.5px] font-semibold tabular-nums text-[#B42318]">
                  {formatMoney(cashExpense)}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4 border-t border-[#E6EBF3] pt-3">
                <dt className="text-[12.5px] font-semibold text-[#334155]">Balance de caja</dt>
                <dd
                  className={`text-[13.5px] font-bold tabular-nums ${
                    cashBalance >= 0 ? "text-[#0A6B3D]" : "text-[#B42318]"
                  }`}
                >
                  {formatMoney(cashBalance)}
                </dd>
              </div>
            </dl>

            {closure ? (
              <div className="rounded-xl border border-[#E6EBF3] bg-white p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#94A3B8]">
                      Cierre asociado
                    </p>
                    <div className="mt-2">
                      <ClosureStatusBadge status={closure.status} />
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    href={`/financials/closures/${closure.id}`}
                  >
                    Ver cierre completo
                  </Button>
                </div>

                <dl className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-[11.5px] font-medium text-[#94A3B8]">Saldo real</dt>
                    <dd className="mt-1 text-[15px] font-bold tabular-nums text-[#0B1220]">
                      {formatMoney(closure.actual_cash ?? 0)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[11.5px] font-medium text-[#94A3B8]">Diferencia</dt>
                    <dd
                      className={`mt-1 text-[15px] font-bold tabular-nums ${getDifferenceTone(
                        closure.difference ?? 0,
                      )}`}
                    >
                      {formatDifference(closure.difference ?? 0)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[11.5px] font-medium text-[#94A3B8]">Responsable</dt>
                    <dd className="mt-1 text-[13px] font-semibold text-[#334155]">
                      {closure.responsible ?? "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[11.5px] font-medium text-[#94A3B8]">Fecha de confirmación</dt>
                    <dd className="mt-1 text-[13px] font-semibold text-[#334155]">
                      {formatDateTime(closure.confirmed_at)}
                    </dd>
                  </div>
                </dl>
              </div>
            ) : (
              <div className="flex min-h-[190px] items-center justify-center rounded-xl border border-dashed border-[#DCE3ED] bg-[#FAFBFD] px-5 text-center">
                <div>
                  <Scale className="mx-auto h-7 w-7 text-[#94A3B8]" aria-hidden="true" />
                  <p className="mt-3 text-[13px] font-semibold text-[#334155]">
                    Todavía no hay un cierre asociado
                  </p>
                  <p className="mt-1 text-[12.5px] text-[#64748B]">
                    Cierra la semana para registrar y confirmar el conteo de caja.
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardBody>
      </Card>

      {isCloseDialogOpen ? (
        <ClosePeriodDialog
          key={period.id}
          open
          period={period}
          onClose={() => setIsCloseDialogOpen(false)}
          onConfirm={handleConfirmClose}
          isSubmitting={isClosing}
        />
      ) : null}
    </div>
  );
}
