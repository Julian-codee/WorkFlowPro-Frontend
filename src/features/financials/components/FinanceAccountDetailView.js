"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Pencil, WalletCards } from "lucide-react";

import {
  Alert,
  Badge,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  EmptyState,
  PageHeader,
  useToast,
} from "@/components/ui";

import {
  ACCOUNT_STATUS_LIST,
  ACCOUNT_TYPES,
  MOVEMENT_STATUSES,
  MOVEMENT_TYPES,
  PAYMENT_METHOD_OPTIONS,
  getAccountTypeMeta,
  getCategoryLabel,
} from "../constants";
import { useFinancialAccount } from "../hooks/useFinancialAccount";
import { updateAccount } from "../services/financialService";
import { hasAccountErrors, validateAccountForm } from "../services/validators";
import { formatDate, formatMoney } from "../utils/format";
import { AccountTypeBadge } from "./FinanceBadges";
import FinanceAccountForm from "./FinanceAccountForm";

function getInitialAccountValues(account) {
  return {
    name: account.name ?? "",
    type: account.type ?? ACCOUNT_TYPES.CASH,
    currency: account.currency ?? "PEN",
    opening_balance: account.opening_balance ?? 0,
    owner: account.owner ?? "",
    branch: account.branch ?? "",
    notes: account.notes ?? "",
  };
}

function buildAccountPayload(values) {
  return {
    name: values.name.trim(),
    type: values.type,
    currency: values.currency,
    opening_balance: Number(values.opening_balance),
    owner: values.owner.trim(),
    branch: values.branch.trim(),
    notes: values.notes.trim(),
  };
}

function getPaymentMethodLabel(value) {
  return PAYMENT_METHOD_OPTIONS.find((option) => option.value === value)?.label ?? value ?? "—";
}

function AccountEditCard({ account, isSaving, onSave, onCancel }) {
  const [values, setValues] = useState(() => getInitialAccountValues(account));
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  function handleChange(event) {
    const { name, value } = event.target;
    const nextValues = { ...values, [name]: value };

    setValues(nextValues);

    if (touched[name]) {
      const fieldErrors = validateAccountForm(nextValues);
      setErrors((current) => ({ ...current, [name]: fieldErrors[name] }));
    }
  }

  function handleBlur(event) {
    const { name, value } = event.target;
    const nextValues = { ...values, [name]: value };
    const fieldErrors = validateAccountForm(nextValues);

    setTouched((current) => ({ ...current, [name]: true }));
    setErrors((current) => ({ ...current, [name]: fieldErrors[name] }));
  }

  async function handleSubmit() {
    const validationErrors = validateAccountForm(values);

    setErrors(validationErrors);
    setTouched(
      Object.keys(validationErrors).reduce(
        (current, key) => ({ ...current, [key]: true }),
        {},
      ),
    );

    if (hasAccountErrors(validationErrors)) return;

    await onSave(buildAccountPayload(values));
  }

  return (
    <Card>
      <CardHeader
        title="Editar cuenta"
        description="Actualiza los datos de la cuenta y guarda los cambios."
      />

      <CardBody>
        <FinanceAccountForm
          values={values}
          errors={errors}
          onChange={handleChange}
          onBlur={handleBlur}
          isLoading={isSaving}
          isEditing
        />
      </CardBody>

      <CardFooter>
        <Button variant="outline" onClick={onCancel} disabled={isSaving}>
          Cancelar
        </Button>

        <Button loading={isSaving} disabled={isSaving} onClick={handleSubmit}>
          Guardar cambios
        </Button>
      </CardFooter>
    </Card>
  );
}

/**
 * Ficha de una cuenta financiera con saldos y movimientos.
 */
export default function FinanceAccountDetailView({ accountId }) {
  const router = useRouter();
  const toast = useToast();

  const { account, status, error, isLoading, reload } = useFinancialAccount(accountId);

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSave(payload) {
    setIsSaving(true);

    try {
      await updateAccount(accountId, payload);
      toast.success("Cuenta actualizada.");
      setIsEditing(false);
      reload();
      return true;
    } catch (requestError) {
      toast.error(requestError?.message ?? "No pudimos actualizar la cuenta.");
      return false;
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Cargando…" description="Consultando la información de la cuenta." />
      </div>
    );
  }

  if (status === "error" || !account) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <Alert variant="error">{error ?? "No encontramos la cuenta solicitada."}</Alert>

        <Button variant="outline" onClick={() => router.push("/financials")}>
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Volver al listado
        </Button>
      </div>
    );
  }

  const movements = account.movements ?? [];
  const accountStats = account.stats ?? {
    income: 0,
    expense: 0,
    balance: 0,
    count: 0,
  };
  const accountType = getAccountTypeMeta(account.type);
  const accountStatus =
    ACCOUNT_STATUS_LIST.find((item) => item.value === account.status) ?? {
      label: "Sin estado",
      tone: "neutral",
    };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Cuenta financiera"
        title={account.name}
        description={`${account.branch ?? "Sin sucursal"} · ${account.owner ?? "Sin responsable"}`}
        actions={
          <>
            <Button variant="outline" onClick={() => router.push("/financials")}>
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Volver
            </Button>

            {!isEditing ? (
              <Button variant="primary" onClick={() => setIsEditing(true)}>
                <Pencil className="h-4 w-4" aria-hidden="true" />
                Editar cuenta
              </Button>
            ) : null}
          </>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <AccountTypeBadge type={account.type} />
        <Badge tone={accountStatus.tone} dot>
          {accountStatus.label}
        </Badge>
      </div>

      {isEditing ? (
        <AccountEditCard
          key={account.id}
          account={account}
          isSaving={isSaving}
          onSave={handleSave}
          onCancel={() => setIsEditing(false)}
        />
      ) : (
        <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr] xl:items-start">
          <Card>
            <CardHeader
              title="Movimientos de la cuenta"
              description={`${movements.length} ${movements.length === 1 ? "movimiento registrado" : "movimientos registrados"}.`}
            />

            <CardBody className="px-0 py-0">
              {movements.length === 0 ? (
                <EmptyState
                  icon={WalletCards}
                  title="Esta cuenta aún no tiene movimientos"
                  description="Los ingresos y egresos registrados aparecerán aquí."
                  className="m-5 border-0 bg-[#FAFBFD] py-10"
                />
              ) : (
                <ul className="divide-y divide-[#F1F4F9]">
                  {movements.map((movement) => {
                    const isIncome = movement.type === MOVEMENT_TYPES.INCOME;
                    const isVoid = movement.status === MOVEMENT_STATUSES.VOID;
                    const sign = isIncome ? "+" : "−";
                    const amountClass = isVoid
                      ? "text-[#94A3B8]"
                      : isIncome
                        ? "text-[#0A6B3D]"
                        : "text-[#B42318]";

                    return (
                      <li
                        key={movement.id}
                        className={`flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center ${
                          isVoid ? "text-[#94A3B8]" : "text-[#475569]"
                        }`}
                      >
                        <div className="w-24 shrink-0 text-[12px] tabular-nums text-[#94A3B8]">
                          {formatDate(movement.movement_date)}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p
                            className={`truncate text-[13.5px] font-semibold ${
                              isVoid ? "text-[#94A3B8]" : "text-[#0B1220]"
                            }`}
                          >
                            {movement.concept}
                          </p>
                          <p className="mt-1 truncate text-[12px] text-[#94A3B8]">
                            {movement.category ? getCategoryLabel(movement.category) : "Sin categoría"}
                            {" · "}
                            {getPaymentMethodLabel(movement.payment_method)}
                          </p>
                        </div>

                        <div className="flex shrink-0 items-center justify-between gap-3 sm:justify-end">
                          {isVoid ? (
                            <Badge
                              tone="neutral"
                              className="border-[#E2E8F0] bg-transparent text-[#94A3B8]"
                            >
                              Anulado
                            </Badge>
                          ) : null}

                          <p className={`text-[13.5px] font-semibold tabular-nums ${amountClass}`}>
                            {sign}
                            {formatMoney(Math.abs(Number(movement.amount ?? 0)), account.currency)}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </CardBody>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader title="Resumen" description="Saldos y acumulados de la cuenta." />

              <CardBody className="px-0 py-0">
                <dl className="divide-y divide-[#F1F4F9] px-5">
                  <div className="flex items-center justify-between gap-4 py-3.5">
                    <dt className="text-[12.5px] text-[#64748B]">Saldo actual</dt>
                    <dd className="text-[13.5px] font-semibold tabular-nums text-[#0B1220]">
                      {formatMoney(account.balance, account.currency)}
                    </dd>
                  </div>

                  <div className="flex items-center justify-between gap-4 py-3.5">
                    <dt className="text-[12.5px] text-[#64748B]">Saldo inicial</dt>
                    <dd className="text-[12.5px] tabular-nums text-[#475569]">
                      {formatMoney(account.opening_balance, account.currency)}
                    </dd>
                  </div>

                  <div className="flex items-center justify-between gap-4 py-3.5">
                    <dt className="text-[12.5px] text-[#64748B]">Total ingresos</dt>
                    <dd className="text-[13px] font-semibold tabular-nums text-[#0A6B3D]">
                      {formatMoney(accountStats.income, account.currency)}
                    </dd>
                  </div>

                  <div className="flex items-center justify-between gap-4 py-3.5">
                    <dt className="text-[12.5px] text-[#64748B]">Total egresos</dt>
                    <dd className="text-[13px] font-semibold tabular-nums text-[#B42318]">
                      {formatMoney(accountStats.expense, account.currency)}
                    </dd>
                  </div>

                  <div className="flex items-center justify-between gap-4 py-3.5">
                    <dt className="text-[12.5px] font-[#475569]">Balance</dt>
                    <dd className="text-[13.5px] font-semibold tabular-nums text-[#0B1220]">
                      {formatMoney(accountStats.balance, account.currency)}
                    </dd>
                  </div>
                </dl>
              </CardBody>
            </Card>

            <Card>
              <CardHeader title="Datos de la cuenta" />

              <CardBody>
                <dl className="space-y-4">
                  <div>
                    <dt className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-[#94A3B8]">
                      Tipo
                    </dt>
                    <dd className="mt-1 text-[13px] text-[#334155]">{accountType.label}</dd>
                  </div>

                  <div>
                    <dt className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-[#94A3B8]">
                      Moneda
                    </dt>
                    <dd className="mt-1 text-[13px] text-[#334155]">{account.currency}</dd>
                  </div>

                  <div>
                    <dt className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-[#94A3B8]">
                      Responsable
                    </dt>
                    <dd className="mt-1 text-[13px] text-[#334155]">
                      {account.owner || "Sin responsable"}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-[#94A3B8]">
                      Sucursal
                    </dt>
                    <dd className="mt-1 text-[13px] leading-5 text-[#334155]">
                      {account.branch || "Sin sucursal"}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-[#94A3B8]">
                      Fecha de creación
                    </dt>
                    <dd className="mt-1 text-[13px] tabular-nums text-[#334155]">
                      {formatDate(account.created_at)}
                    </dd>
                  </div>

                  <div className="border-t border-[#F1F4F9] pt-4">
                    <dt className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-[#94A3B8]">
                      Notas
                    </dt>
                    <dd className="mt-1 whitespace-pre-line text-[13px] leading-5 text-[#475569]">
                      {account.notes || "Sin notas registradas."}
                    </dd>
                  </div>
                </dl>
              </CardBody>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
