"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CalendarClock,
  Check,
  Clock3,
  LoaderCircle,
  Pencil,
  Save,
  Trash2,
} from "lucide-react";

import {
  Alert,
  Badge,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Modal,
  PageHeader,
  useToast,
} from "@/components/ui";

import { MOVEMENT_STATUSES, getCategoryLabel } from "../constants";
import { useFinancialAccounts } from "../hooks/useFinancialAccounts";
import { useFinancialMovement } from "../hooks/useFinancialMovement";
import { useFinancialMovementForm } from "../hooks/useFinancialMovementForm";
import { canDeleteMovement } from "../services/validators";
import { deleteMovement, updateMovement } from "../services/financialService";
import { formatAmount, formatDate, formatDateTime } from "../utils/format";
import FinanceMovementForm from "./FinanceMovementForm";
import { MovementTypeBadge } from "./FinanceBadges";

/**
 * Detalle de un movimiento: consulta, edición y eliminación.
 *
 * Consume:
 *   GET    /financial/movements/{id}
 *   PATCH  /financial/movements/{id}
 *   DELETE /financial/movements/{id}
 */
export default function FinanceMovementDetailView({ movementId }) {
  const router = useRouter();
  const toast = useToast();

  const { movement, status, error, isLoading, reload } = useFinancialMovement(movementId);
  const { accounts } = useFinancialAccounts();

  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const account = useMemo(
    () => accounts.find((item) => item.id === movement?.account_id),
    [accounts, movement?.account_id],
  );

  const handleDelete = async () => {
    setIsDeleting(true);
    setDeleteError(null);

    try {
      await deleteMovement(movement.id);
      toast.success("Movimiento eliminado.");
      router.push("/financials/movements");
    } catch (requestError) {
      setDeleteError(requestError?.message ?? "No pudimos eliminar el movimiento.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Movimiento" description="Cargando la información del movimiento…" />
      </div>
    );
  }

  if (status === "error" || !movement) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <Alert variant="error">{error ?? "No encontramos el movimiento solicitado."}</Alert>

        <Button variant="outline" onClick={() => router.push("/financials/movements")}>
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Volver al registro
        </Button>
      </div>
    );
  }

  const isLate = movement.origin === "late";
  const isVoid = movement.status === MOVEMENT_STATUSES.VOID;
  const canDelete = canDeleteMovement(movement);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Movimiento"
        title={movement.concept}
        description={`${movement.reference} · ${formatDate(movement.movement_date)}`}
        actions={
          <>
            <Button variant="outline" onClick={() => router.push("/financials/movements")}>
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Volver
            </Button>

            {canDelete ? (
              <Button variant="dangerGhost" onClick={() => setIsDeleteOpen(true)} disabled={isEditing}>
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                Eliminar
              </Button>
            ) : null}

            {!isEditing ? (
              <Button variant="primary" onClick={() => setIsEditing(true)}>
                <Pencil className="h-4 w-4" aria-hidden="true" />
                Editar
              </Button>
            ) : null}
          </>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <MovementTypeBadge type={movement.type} />

        {movement.status === MOVEMENT_STATUSES.RECONCILED ? (
          <Badge tone="success" dot>
            Conciliado
          </Badge>
        ) : movement.status === MOVEMENT_STATUSES.VOID ? (
          <Badge tone="neutral" dot>
            Anulado
          </Badge>
        ) : (
          <Badge tone="info" dot>
            Registrado
          </Badge>
        )}

        {isLate ? (
          <Badge tone="warning">
            <Clock3 className="h-3 w-3" aria-hidden="true" />
            Registro tardío
          </Badge>
        ) : null}
      </div>

      {isLate ? (
        <Alert variant="warning" title="Movimiento registrado fuera de su semana">
          El hecho económico corresponde al {formatDate(movement.movement_date)} pero se registró el{" "}
          {formatDateTime(movement.registered_at)}. El cierre original de esa semana se mantiene sin
          cambios.
        </Alert>
      ) : null}

      {isEditing ? (
        <MovementEditSection
          key={movement.id}
          movement={movement}
          onCancel={() => setIsEditing(false)}
          onSaved={() => {
            toast.success("Movimiento actualizado.");
            setIsEditing(false);
            reload();
          }}
        />
      ) : (
        <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr] xl:items-start">
          <Card>
            <CardHeader title="Detalle del movimiento" description="Importes, cuentas y método de pago." />

            <CardBody className="space-y-5">
              <div className="rounded-2xl border border-[#EEF1F6] bg-[#FBFCFE] p-5">
                <p className="text-[12px] font-medium text-[#64748B]">
                  {movement.type === "income" ? "Ingreso" : "Egreso"}
                </p>

                <p
                  className={`mt-1 text-[30px] font-bold leading-none tracking-[-0.03em] tabular-nums ${
                    movement.type === "income" ? "text-[#0A6B3D]" : "text-[#B42318]"
                  }`}
                >
                  {movement.type === "income" ? "+" : "−"}
                  {formatAmount(movement.amount)}
                </p>

                <p className="mt-2 text-[12px] text-[#94A3B8]">
                  {getCategoryLabel(movement.category)}
                </p>
              </div>

              <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
                <InfoRow label="Fecha del movimiento" value={formatDate(movement.movement_date)} />
                <InfoRow label="Fecha de registro" value={formatDateTime(movement.registered_at)} />
                <InfoRow label="Cuenta" value={account?.name ?? "Cuenta sin asignar"} />
                <InfoRow label="Método de pago" value={getPaymentMethodLabel(movement.payment_method)} />
                <InfoRow label="Referencia" value={movement.reference || "—"} />
                <InfoRow label="Categoría" value={getCategoryLabel(movement.category)} />
              </dl>

              {movement.notes ? (
                <div className="rounded-xl border border-[#EEF1F6] bg-white p-4">
                  <p className="text-[12px] font-semibold text-[#334155]">Observaciones</p>
                  <p className="mt-1.5 whitespace-pre-line text-[13px] leading-6 text-[#475569]">
                    {movement.notes}
                  </p>
                </div>
              ) : null}
            </CardBody>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader title="Periodo semanal" description="Semana a la que pertenece el movimiento." />

              <CardBody>
                <div className="flex items-start gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#EFF4FF] text-[#2E6BFF]">
                    <CalendarClock className="h-4 w-4" aria-hidden="true" />
                  </span>

                  <div>
                    <p className="text-[13px] font-semibold text-[#0B1220]">
                      Acumuladores de la semana
                    </p>
                    <p className="mt-1 text-[12px] leading-5 text-[#64748B]">
                      Los totales de la semana se reinician cada lunes. Este movimiento suma a los
                      acumuladores de su semana y a los saldos de la cuenta.
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardHeader title="Acciones" description="Operaciones disponibles sobre el movimiento." />

              <CardBody className="space-y-3">
                <Button variant="outline" className="w-full" onClick={() => setIsEditing(true)}>
                  <Pencil className="h-4 w-4" aria-hidden="true" />
                  Editar movimiento
                </Button>

                {canDelete ? (
                  <Button
                    variant="dangerGhost"
                    className="w-full"
                    onClick={() => setIsDeleteOpen(true)}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                    Eliminar movimiento
                  </Button>
                ) : (
                  <Alert variant="info">
                    Los movimientos conciliados no se pueden eliminar: forman parte del cierre de
                    caja.
                  </Alert>
                )}
              </CardBody>
            </Card>
          </div>
        </div>
      )}

      <Modal
        open={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Eliminar movimiento"
        description="Esta acción no se puede deshacer."
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)} disabled={isDeleting}>
              Cancelar
            </Button>
            <Button variant="danger" loading={isDeleting} onClick={handleDelete}>
              {!isDeleting ? <Trash2 className="h-4 w-4" aria-hidden="true" /> : null}
              Eliminar movimiento
            </Button>
          </>
        }
      >
        {deleteError ? <Alert variant="error">{deleteError}</Alert> : null}

        <p className="text-[13.5px] leading-6 text-[#475569]">
          ¿Seguro que quieres eliminar el movimiento{" "}
          <span className="font-semibold text-[#0B1220]">“{movement.concept}”</span> por{" "}
          <span className="font-semibold text-[#0B1220]">{formatAmount(movement.amount)}</span>?
        </p>

        <p className="mt-3 flex items-center gap-1.5 text-[12px] leading-5 text-[#94A3B8]">
          <Check className="h-3.5 w-3.5" aria-hidden="true" />
          Los saldos de las cuentas y los acumuladores de la semana se recalcularán al instante.
        </p>
      </Modal>
    </div>
  );
}

/**
 * Formulario de edición de un movimiento.
 *
 * Se monta con `key={movement.id}` para que el hook del formulario reciba los
 * valores iniciales con el movimiento ya cargado.
 */
function MovementEditSection({ movement, onCancel, onSaved }) {
  const initialValues = useMemo(
    () => ({
      type: movement.type ?? "expense",
      concept: movement.concept ?? "",
      category: movement.category ?? "",
      amount: movement.amount ?? "",
      account_id: movement.account_id ?? "",
      payment_method: movement.payment_method ?? "cash",
      movement_date: movement.movement_date ?? "",
      reference: movement.reference ?? "",
      notes: movement.notes ?? "",
    }),
    [movement],
  );

  const {
    values,
    errors,
    formError,
    isLoading,
    handleChange,
    handleBlur,
    setFieldValue,
    submitMovement,
  } = useFinancialMovementForm({ initialValues, movementId: movement.id });

  function handleTypeChange(type) {
    setFieldValue("type", type);
  }

  async function handleSave() {
    const saved = await submitMovement();

    if (saved) onSaved(saved);
  }

  return (
    <Card>
      <CardHeader title="Editar movimiento" description="Actualiza los datos y guarda los cambios." />

      <CardBody className="pt-6">
        {formError ? <Alert variant="error">{formError}</Alert> : null}

        <FinanceMovementForm
          values={values}
          errors={errors}
          onChange={handleChange}
          onBlur={handleBlur}
          onTypeChange={handleTypeChange}
          isLoading={isLoading}
          isEditing
        />
      </CardBody>

      <CardFooter>
        <Button variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancelar
        </Button>

        <Button loading={isLoading} disabled={isLoading} onClick={handleSave}>
          {isLoading ? (
            <>
              <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
              Guardando…
            </>
          ) : (
            <>
              <Save className="h-4 w-4" aria-hidden="true" />
              Guardar cambios
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}

/** Fila de información. */
function InfoRow({ label, value }) {
  return (
    <div>
      <dt className="text-[12px] font-medium text-[#94A3B8]">{label}</dt>
      <dd className="mt-0.5 text-[13.5px] font-medium text-[#0B1220]">{value}</dd>
    </div>
  );
}

/** Etiqueta legible del método de pago. */
function getPaymentMethodLabel(value) {
  const labels = {
    cash: "Efectivo",
    transfer: "Transferencia",
    debit_card: "Tarjeta de débito",
    credit_card: "Tarjeta de crédito",
    digital_wallet: "Billetera digital",
    check: "Cheque",
  };

  return labels[value] ?? value ?? "—";
}
