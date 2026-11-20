"use client";

import { useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  History,
  Trash2,
  UserRound,
  WalletCards,
} from "lucide-react";
import { useRouter } from "next/navigation";

import {
  Alert,
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  Modal,
  Select,
  Skeleton,
  useToast,
} from "@/components/ui";

import { PAYMENT_METHODS, TASK_PRIORITY_OPTIONS, TASK_STATUS_OPTIONS } from "../constants";
import { useTaskPayments } from "../hooks/useTaskPayments";
import { deleteTask, updateTaskPriority, updateTaskStatus } from "../services/taskService";
import { formatDate, formatDateTime, formatMoney, getAssigneeLabel, isTaskOverdue } from "../utils/format";
import { TaskPaymentBadge, TaskPriorityBadge, TaskStatusBadge } from "./TaskBadges";
import DeleteTaskDialog from "./DeleteTaskDialog";
import TaskPaymentModal from "./TaskPaymentModal";

function getPaymentMethodLabel(value) {
  return PAYMENT_METHODS.find((method) => method.value === value)?.label ?? value ?? "Sin método";
}

/**
 * Panel de detalle operativo y financiero de una tarea.
 *
 * Finalizar solo cambia el estado operativo: nunca registra un ingreso ni
 * cancela el saldo pendiente. Los abonos usan exclusivamente el endpoint de
 * pagos de tareas.
 */
export default function TaskDetail({ task, onTaskChange }) {
  const router = useRouter();
  const toast = useToast();
  const payments = useTaskPayments(task?.id);

  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isCompleteDialogOpen, setIsCompleteDialogOpen] = useState(false);
  const [error, setError] = useState(null);

  if (!task) return null;

  const pendingBalance = Number(task.pending_balance ?? 0);
  const overdue = isTaskOverdue(task);

  async function performStatusChange(status) {
    setIsUpdating(true);
    setError(null);

    try {
      const updated = await updateTaskStatus(task.id, status);
      onTaskChange?.(updated);
      toast.success(status === "completed" ? "Tarea finalizada." : "Estado actualizado.");
      return true;
    } catch (requestError) {
      setError(requestError?.message ?? "No pudimos actualizar el estado.");
      return false;
    } finally {
      setIsUpdating(false);
    }
  }

  function handleStatusChange(event) {
    const status = event.target.value;

    if (status === "completed" && task.status !== "completed") {
      setIsCompleteDialogOpen(true);
      return;
    }

    performStatusChange(status);
  }

  async function handleConfirmComplete() {
    const updated = await performStatusChange("completed");
    if (updated) setIsCompleteDialogOpen(false);
  }

  async function handlePriorityChange(event) {
    const priority = event.target.value;
    setIsUpdating(true);
    setError(null);

    try {
      const updated = await updateTaskPriority(task.id, priority);
      onTaskChange?.(updated);
      toast.success("Prioridad actualizada.");
    } catch (requestError) {
      setError(requestError?.message ?? "No pudimos actualizar la prioridad.");
    } finally {
      setIsUpdating(false);
    }
  }

  async function handleDelete() {
    setIsDeleting(true);
    setError(null);

    try {
      await deleteTask(task.id);
      setIsDialogOpen(false);
      toast.success("Tarea eliminada.");
      router.push("/tasks");
    } catch (requestError) {
      setError(requestError?.message ?? "No pudimos eliminar la tarea.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      <div className="space-y-6">
        <Card>
          <CardHeader
            title="Resumen financiero"
            description="Los importes y saldos mostrados proceden del backend."
            action={
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsPaymentOpen(true)}
                disabled={pendingBalance <= 0}
              >
                <WalletCards className="h-3.5 w-3.5" aria-hidden="true" />
                Registrar abono
              </Button>
            }
          />

          <CardBody>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <div className="rounded-xl border border-[#EEF1F6] bg-[#FBFCFE] p-3.5">
                <p className="text-[10.5px] font-semibold uppercase tracking-[0.09em] text-[#94A3B8]">
                  Precio total
                </p>
                <p className="mt-1.5 text-[15px] font-bold tabular-nums text-[#334155]">
                  {task.total_price === null || task.total_price === undefined
                    ? "Sin precio"
                    : formatMoney(task.total_price)}
                </p>
              </div>
              <div className="rounded-xl border border-[#CDEBD8] bg-[#F0FBF4] p-3.5">
                <p className="text-[10.5px] font-semibold uppercase tracking-[0.09em] text-[#0A6B3D]">
                  Total abonado
                </p>
                <p className="mt-1.5 text-[15px] font-bold tabular-nums text-[#0A6B3D]">
                  {formatMoney(task.total_paid)}
                </p>
              </div>
              <div className="rounded-xl border border-[#F4C7CA] bg-[#FEF4F4] p-3.5">
                <p className="text-[10.5px] font-semibold uppercase tracking-[0.09em] text-[#B42318]">
                  Saldo pendiente
                </p>
                <p className="mt-1.5 text-[15px] font-bold tabular-nums text-[#B42318]">
                  {formatMoney(pendingBalance)}
                </p>
              </div>
              <div className="rounded-xl border border-[#EEF1F6] bg-[#FBFCFE] p-3.5">
                <p className="text-[10.5px] font-semibold uppercase tracking-[0.09em] text-[#94A3B8]">
                  Estado del pago
                </p>
                <div className="mt-2">
                  <TaskPaymentBadge status={task.payment_status} totalPrice={task.total_price} />
                </div>
              </div>
            </div>

            {pendingBalance <= 0 ? (
              <p className="mt-3 text-[12px] text-[#64748B]">
                Esta tarea no tiene saldo pendiente. Finalizarla no genera ingresos adicionales.
              </p>
            ) : null}
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Detalles operativos"
            description="El estado y la prioridad son independientes del estado financiero."
            action={
              <Button
                variant="dangerGhost"
                size="sm"
                onClick={() => setIsDialogOpen(true)}
                disabled={isUpdating || isDeleting}
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                Eliminar
              </Button>
            }
          />

          <CardBody className="space-y-5">
            {error ? <Alert variant="error">{error}</Alert> : null}

            <div className="grid gap-5 sm:grid-cols-2">
              <Select
                id="detail-status"
                name="status"
                label="Estado"
                value={task.status}
                onChange={handleStatusChange}
                options={TASK_STATUS_OPTIONS}
                disabled={isUpdating}
              />

              <Select
                id="detail-priority"
                name="priority"
                label="Prioridad"
                value={task.priority}
                onChange={handlePriorityChange}
                options={TASK_PRIORITY_OPTIONS}
                disabled={isUpdating}
              />
            </div>

            <dl className="grid gap-4 border-t border-[#F1F4F9] pt-5 sm:grid-cols-2">
              <div>
                <dt className="text-[11.5px] font-semibold uppercase tracking-[0.12em] text-[#94A3B8]">
                  Cliente
                </dt>
                <dd className="mt-1.5 flex items-center gap-1.5 text-[13.5px] text-[#334155]">
                  <UserRound className="h-4 w-4 text-[#94A3B8]" aria-hidden="true" />
                  {task.customer_name || "Sin cliente"}
                </dd>
              </div>

              <div>
                <dt className="text-[11.5px] font-semibold uppercase tracking-[0.12em] text-[#94A3B8]">
                  Responsable
                </dt>
                <dd className="mt-1.5 flex items-center gap-1.5 text-[13.5px] text-[#334155]">
                  <UserRound className="h-4 w-4 text-[#94A3B8]" aria-hidden="true" />
                  {getAssigneeLabel(task)}
                </dd>
              </div>

              <div>
                <dt className="text-[11.5px] font-semibold uppercase tracking-[0.12em] text-[#94A3B8]">
                  Vencimiento
                </dt>
                <dd
                  className={`mt-1.5 flex items-center gap-1.5 text-[13.5px] ${
                    overdue ? "font-semibold text-[#B42318]" : "text-[#334155]"
                  }`}
                >
                  <CalendarDays className="h-4 w-4 text-[#94A3B8]" aria-hidden="true" />
                  {task.due_date ? formatDate(task.due_date) : "Sin fecha"}
                  {overdue ? <Badge tone="danger">Vencida</Badge> : null}
                </dd>
              </div>

              <div>
                <dt className="text-[11.5px] font-semibold uppercase tracking-[0.12em] text-[#94A3B8]">
                  Actualizada
                </dt>
                <dd className="mt-1.5 text-[13.5px] text-[#334155]">
                  {formatDateTime(task.updated_at)}
                </dd>
              </div>
            </dl>

            <div className="flex flex-wrap items-center gap-2 border-t border-[#F1F4F9] pt-5">
              <span className="text-[12px] text-[#94A3B8]">Estado actual:</span>
              <TaskStatusBadge status={task.status} />
              <TaskPriorityBadge priority={task.priority} />
              {task.status !== "completed" ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="ml-auto"
                  onClick={() => setIsCompleteDialogOpen(true)}
                  disabled={isUpdating}
                >
                  <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                  Finalizar tarea
                </Button>
              ) : null}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Historial de abonos"
            description="Movimientos de ingreso registrados por el backend para esta tarea."
            action={
              <span className="inline-flex items-center gap-1.5 text-[11.5px] text-[#94A3B8]">
                <History className="h-3.5 w-3.5" aria-hidden="true" />
                {payments.total} {payments.total === 1 ? "abono" : "abonos"}
              </span>
            }
          />

          <CardBody>
            {payments.isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : payments.error ? (
              <Alert variant="error">{payments.error}</Alert>
            ) : payments.payments.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[#DCE3ED] px-5 py-8 text-center">
                <CircleDollarSign className="mx-auto h-7 w-7 text-[#94A3B8]" aria-hidden="true" />
                <p className="mt-2 text-[13px] font-semibold text-[#334155]">Aún no hay abonos</p>
                <p className="mt-1 text-[12px] text-[#64748B]">
                  Registra el primero con el formulario de abonos.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {payments.payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="rounded-xl border border-[#E6EBF3] bg-[#FBFCFE] p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-[14px] font-bold tabular-nums text-[#0A6B3D]">
                          {formatMoney(payment.amount)}
                        </p>
                        <p className="mt-1 text-[12px] text-[#64748B]">
                          {formatDate(payment.transaction_date)} · {payment.cash_account_name || "Cuenta"}
                        </p>
                      </div>
                      <Badge tone="success">{getPaymentMethodLabel(payment.payment_method)}</Badge>
                    </div>

                    <div className="mt-3 grid gap-2 border-t border-[#E6EBF3] pt-3 text-[11.5px] text-[#64748B] sm:grid-cols-2">
                      <p>
                        <span className="font-semibold text-[#475569]">Referencia:</span>{" "}
                        {payment.reference || "Sin referencia"}
                      </p>
                      <p>
                        <span className="font-semibold text-[#475569]">Registrado:</span>{" "}
                        {formatDateTime(payment.recorded_at)}
                      </p>
                      {payment.description ? (
                        <p className="sm:col-span-2">
                          <span className="font-semibold text-[#475569]">Detalle:</span>{" "}
                          {payment.description}
                        </p>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {payments.totalPages > 1 ? (
              <div className="mt-4 flex items-center justify-between gap-3 border-t border-[#EEF1F6] pt-4">
                <p className="text-[11.5px] text-[#64748B]">
                  Página {payments.page} de {payments.totalPages}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => payments.setPage(Math.max(1, payments.page - 1))}
                    disabled={payments.page <= 1 || payments.isLoading}
                  >
                    <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      payments.setPage(Math.min(payments.totalPages, payments.page + 1))
                    }
                    disabled={payments.page >= payments.totalPages || payments.isLoading}
                  >
                    Siguiente
                    <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </Button>
                </div>
              </div>
            ) : null}
          </CardBody>
        </Card>
      </div>

      <Modal
        open={isCompleteDialogOpen}
        onClose={() => !isUpdating && setIsCompleteDialogOpen(false)}
        title="Finalizar tarea"
        description="Esta acción cambia únicamente el estado operativo."
        size="sm"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setIsCompleteDialogOpen(false)}
              disabled={isUpdating}
            >
              Cancelar
            </Button>
            <Button
              variant="brand"
              loading={isUpdating}
              onClick={handleConfirmComplete}
              disabled={isUpdating}
            >
              Finalizar tarea
            </Button>
          </>
        }
      >
        <p className="text-[13.5px] leading-6 text-[#475569]">
          ¿Seguro que quieres finalizar{" "}
          <span className="font-semibold text-[#0B1220]">“{task.title}”</span>?
        </p>
        <Alert
          variant={pendingBalance > 0 ? "warning" : "info"}
          title="La deuda no se modifica"
          className="mt-4"
        >
          {pendingBalance > 0
            ? `El saldo pendiente de ${formatMoney(pendingBalance)} seguirá registrado. Finalizar no genera ingresos ni cancela la deuda.`
            : "Finalizar no registra ingresos ni crea movimientos financieros."}
        </Alert>
      </Modal>

      <TaskPaymentModal
        open={isPaymentOpen}
        task={task}
        onClose={() => setIsPaymentOpen(false)}
      />

      <DeleteTaskDialog
        open={isDialogOpen}
        task={task}
        isDeleting={isDeleting}
        onConfirm={handleDelete}
        onClose={() => setIsDialogOpen(false)}
      />
    </>
  );
}
