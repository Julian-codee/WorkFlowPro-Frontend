"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  ClipboardList,
  FileCheck2,
  Scale,
  SlidersHorizontal,
  UserRound,
} from "lucide-react";

import {
  Alert,
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  EmptyState,
  PageHeader,
  Textarea,
  useToast,
} from "@/components/ui";

import {
  ADJUSTMENT_STATUSES,
  ADJUSTMENT_TYPES,
  CLOSURE_STATUSES,
} from "../constants";
import { useFinancialClosure } from "../hooks/useFinancialClosure";
import {
  confirmClosure,
  createClosureAdjustment,
  resolveAdjustment,
} from "../services/financialService";
import { formatDateTime, formatMoney, formatWeekRange } from "../utils/format";
import { AdjustmentTypeBadge, ClosureStatusBadge } from "./FinanceBadges";
import { AdjustmentDialog, ConfirmClosureDialog } from "./FinanceClosureDialogs";

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

function getAdjustmentStatusBadge(status) {
  if (status === ADJUSTMENT_STATUSES.RESOLVED) {
    return <Badge tone="success">Resuelto</Badge>;
  }

  return <Badge tone="warning">Pendiente</Badge>;
}

/**
 * Detalle de un cierre de caja y sus ajustes posteriores.
 */
export default function FinanceClosureDetailView({ closureId }) {
  const router = useRouter();
  const toast = useToast();
  const { closure, status, error, isLoading, reload } = useFinancialClosure(closureId);

  const [dialog, setDialog] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resolvingAdjustmentId, setResolvingAdjustmentId] = useState(null);
  const [resolutionJustification, setResolutionJustification] = useState("");
  const [resolutionError, setResolutionError] = useState("");
  const [isResolving, setIsResolving] = useState(false);

  async function handleConfirmClosure(payload) {
    if (!closure) return;

    setIsSubmitting(true);

    try {
      await confirmClosure(closure.id, payload);
      setDialog(null);
      toast.success("Cierre confirmado.");
      reload();
    } catch (requestError) {
      toast.error(requestError?.message ?? "No pudimos confirmar el cierre.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleCreateAdjustment(payload) {
    if (!closure) return;

    setIsSubmitting(true);

    try {
      await createClosureAdjustment(closure.id, payload);
      setDialog(null);
      toast.success("Ajuste registrado.");
      reload();
    } catch (requestError) {
      toast.error(requestError?.message ?? "No pudimos registrar el ajuste.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleStartResolution(adjustment) {
    setResolvingAdjustmentId(adjustment.id);
    setResolutionJustification(adjustment.justification ?? "");
    setResolutionError("");
  }

  function handleCancelResolution() {
    setResolvingAdjustmentId(null);
    setResolutionJustification("");
    setResolutionError("");
  }

  async function handleResolveAdjustment(adjustment) {
    if (!resolutionJustification.trim()) {
      setResolutionError("Ingresa la justificación final del ajuste.");
      return;
    }

    setIsResolving(true);

    try {
      await resolveAdjustment(adjustment.id, {
        status: ADJUSTMENT_STATUSES.RESOLVED,
        justification: resolutionJustification.trim(),
        resolved_by: "Ana Morales",
      });
      setResolvingAdjustmentId(null);
      setResolutionJustification("");
      toast.success("Ajuste resuelto.");
      reload();
    } catch (requestError) {
      toast.error(requestError?.message ?? "No pudimos resolver el ajuste.");
    } finally {
      setIsResolving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Cargando…" description="Preparando el detalle del cierre de caja." />
      </div>
    );
  }

  if (status === "error" || !closure) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <Alert variant="error">{error ?? "No encontramos el cierre solicitado."}</Alert>

        <Button variant="outline" onClick={() => router.push("/financials/closures")}>
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Volver
        </Button>
      </div>
    );
  }

  const adjustments = closure.adjustments ?? [];
  const difference = Number(closure.difference ?? 0);
  const differenceType =
    difference < 0 ? ADJUSTMENT_TYPES.SHORTAGE : ADJUSTMENT_TYPES.SURPLUS;
  const observations = [closure.observations, closure.notes].filter(
    (observation) => observation && observation.trim(),
  );

  const summaryRows = [
    { label: "Ingresos", value: formatMoney(closure.total_income ?? 0), tone: "text-[#0A6B3D]" },
    { label: "Egresos", value: formatMoney(closure.total_expense ?? 0), tone: "text-[#B42318]" },
    { label: "Balance neto", value: formatMoney(closure.net ?? 0), tone: getDifferenceTone(closure.net ?? 0) },
    { label: "Saldo esperado", value: formatMoney(closure.expected_cash ?? 0), tone: "text-[#0B1220]" },
    { label: "Saldo real", value: formatMoney(closure.actual_cash ?? 0), tone: "text-[#0B1220]" },
    {
      label: "Diferencia",
      value: formatDifference(difference),
      tone: getDifferenceTone(difference),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Cierre de caja"
        title={`Semana ${closure.number}`}
        description={formatWeekRange(closure.start_date, closure.end_date)}
        actions={
          <>
            <Button variant="outline" onClick={() => router.push("/financials/closures")}>
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Volver
            </Button>

            <Button variant="outline" onClick={() => setDialog("adjustment")}>
              <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
              Registrar ajuste
            </Button>

            {closure.status === CLOSURE_STATUSES.DRAFT ? (
              <Button variant="brand" onClick={() => setDialog("confirm")}>
                <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                Confirmar cierre
              </Button>
            ) : null}
          </>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <ClosureStatusBadge status={closure.status} />
        {difference !== 0 ? <AdjustmentTypeBadge type={differenceType} /> : null}
      </div>

      {closure.status === CLOSURE_STATUSES.CONFIRMED ? (
        <Alert variant="info">
          Los ajustes registrados después del cierre no modifican el conteo original; quedan
          documentados para su revisión.
        </Alert>
      ) : null}

      <div className="grid gap-5 xl:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader
            title="Resumen del cierre"
            description="Totales conciliados y diferencia del conteo físico."
          />
          <CardBody className="pt-6">
            <div className="overflow-hidden rounded-xl border border-[#EEF1F6]">
              <table className="w-full border-collapse">
                <tbody>
                  {summaryRows.map((row, index) => (
                    <tr
                      key={row.label}
                      className={index > 0 ? "border-t border-[#F1F4F9]" : "bg-[#FAFBFD]"}
                    >
                      <td className="px-4 py-3.5 text-[12.5px] font-medium text-[#64748B]">
                        {row.label}
                      </td>
                      <td className={`px-4 py-3.5 text-right text-[13.5px] font-bold tabular-nums ${row.tone}`}>
                        {row.value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <dl className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#F7F9FC] text-[#64748B]">
                  <UserRound className="h-4 w-4" aria-hidden="true" />
                </span>
                <div>
                  <dt className="text-[11.5px] font-medium text-[#94A3B8]">Responsable</dt>
                  <dd className="mt-1 text-[13px] font-semibold text-[#334155]">
                    {closure.responsible ?? "—"}
                  </dd>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#F7F9FC] text-[#64748B]">
                  <FileCheck2 className="h-4 w-4" aria-hidden="true" />
                </span>
                <div>
                  <dt className="text-[11.5px] font-medium text-[#94A3B8]">Fecha de creación</dt>
                  <dd className="mt-1 text-[13px] font-semibold text-[#334155]">
                    {formatDateTime(closure.created_at)}
                  </dd>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#F0FBF4] text-[#0A6B3D]">
                  <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                </span>
                <div>
                  <dt className="text-[11.5px] font-medium text-[#94A3B8]">Fecha de confirmación</dt>
                  <dd className="mt-1 text-[13px] font-semibold text-[#334155]">
                    {formatDateTime(closure.confirmed_at)}
                  </dd>
                </div>
              </div>
            </dl>
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Observaciones"
            description="Notas y comentarios registrados durante la conciliación."
          />
          <CardBody className="pt-6">
            {observations.length > 0 ? (
              <div className="space-y-4">
                {observations.map((observation, index) => (
                  <div
                    key={`${observation}-${index}`}
                    className="rounded-xl border border-[#EEF1F6] bg-[#FAFBFD] px-4 py-3.5"
                  >
                    <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#94A3B8]">
                      {index === 0 && closure.observations ? "Observaciones" : "Notas"}
                    </p>
                    <p className="mt-2 whitespace-pre-wrap text-[13px] leading-5 text-[#475569]">
                      {observation}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex min-h-[180px] items-center justify-center rounded-xl border border-dashed border-[#DCE3ED] bg-[#FAFBFD] px-5 text-center">
                <div>
                  <ClipboardList className="mx-auto h-7 w-7 text-[#94A3B8]" aria-hidden="true" />
                  <p className="mt-3 text-[13px] font-semibold text-[#334155]">Sin observaciones</p>
                  <p className="mt-1 text-[12.5px] text-[#64748B]">
                    Este cierre no tiene comentarios registrados.
                  </p>
                </div>
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader
          title="Ajustes posteriores al cierre"
          description="Diferencias documentadas después del conteo original."
          action={
            <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#64748B]">
              <Scale className="h-3.5 w-3.5" aria-hidden="true" />
              {adjustments.length} {adjustments.length === 1 ? "ajuste" : "ajustes"}
            </span>
          }
        />
        <CardBody className="pt-6">
          {adjustments.length === 0 ? (
            <EmptyState
              icon={SlidersHorizontal}
              title="No hay ajustes registrados"
              description="Los faltantes o sobrantes posteriores al cierre aparecerán documentados aquí."
              action={
                <Button variant="outline" onClick={() => setDialog("adjustment")}>
                  Registrar ajuste
                </Button>
              }
              className="border-0 bg-transparent"
            />
          ) : (
            <div className="space-y-4">
              {adjustments.map((adjustment) => {
                const isResolutionOpen = resolvingAdjustmentId === adjustment.id;

                return (
                  <article
                    key={adjustment.id}
                    className="rounded-xl border border-[#E6EBF3] bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.03)]"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <AdjustmentTypeBadge type={adjustment.type} />
                        <span className="text-[14px] font-bold tabular-nums text-[#0B1220]">
                          {formatMoney(adjustment.amount ?? 0)}
                        </span>
                      </div>
                      {getAdjustmentStatusBadge(adjustment.status)}
                    </div>

                    <dl className="mt-4 grid gap-4 sm:grid-cols-2">
                      <div>
                        <dt className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#94A3B8]">
                          Causa
                        </dt>
                        <dd className="mt-1.5 text-[13px] leading-5 text-[#475569]">
                          {adjustment.reason ?? "—"}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#94A3B8]">
                          Justificación
                        </dt>
                        <dd className="mt-1.5 text-[13px] leading-5 text-[#475569]">
                          {adjustment.justification ?? "—"}
                        </dd>
                      </div>
                    </dl>

                    {adjustment.status === ADJUSTMENT_STATUSES.RESOLVED ? (
                      <p className="mt-4 border-t border-[#F1F4F9] pt-3 text-[11.5px] text-[#94A3B8]">
                        Resuelto por {adjustment.resolved_by ?? "—"} ·{" "}
                        {formatDateTime(adjustment.resolved_at)}
                      </p>
                    ) : isResolutionOpen ? (
                      <div className="mt-4 border-t border-[#F1F4F9] pt-4">
                        <Textarea
                          id={`resolve-adjustment-${adjustment.id}`}
                          name="resolution"
                          label="Justificación final"
                          value={resolutionJustification}
                          onChange={(event) => {
                            setResolutionJustification(event.target.value);
                            setResolutionError("");
                          }}
                          error={resolutionError}
                          placeholder="Documenta cómo se resolvió y regularizó el ajuste."
                          rows={4}
                          maxLength={500}
                          required
                        />

                        <div className="mt-3 flex flex-wrap justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleCancelResolution}
                            disabled={isResolving}
                          >
                            Cancelar
                          </Button>
                          <Button
                            variant="brand"
                            size="sm"
                            loading={isResolving}
                            onClick={() => handleResolveAdjustment(adjustment)}
                          >
                            Guardar resolución
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-4 border-t border-[#F1F4F9] pt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStartResolution(adjustment)}
                        >
                          Resolver ajuste
                        </Button>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </CardBody>
      </Card>

      {dialog === "confirm" ? (
        <ConfirmClosureDialog
          key={`${closure.id}-${dialog}`}
          open
          closure={closure}
          onClose={() => setDialog(null)}
          onConfirm={handleConfirmClosure}
          isSubmitting={isSubmitting}
        />
      ) : null}

      {dialog === "adjustment" ? (
        <AdjustmentDialog
          key={`${closure.id}-${dialog}`}
          open
          closure={closure}
          onClose={() => setDialog(null)}
          onConfirm={handleCreateAdjustment}
          isSubmitting={isSubmitting}
        />
      ) : null}
    </div>
  );
}
