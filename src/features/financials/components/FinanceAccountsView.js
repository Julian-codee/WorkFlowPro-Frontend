"use client";

import { useState } from "react";
import {
  Banknote,
  CircleDollarSign,
  Landmark,
  Plus,
  Smartphone,
  WalletCards,
} from "lucide-react";

import {
  Alert,
  Button,
  Card,
  CardBody,
  EmptyState,
  Input,
  Modal,
  PageHeader,
  Select,
  useToast,
} from "@/components/ui";

import {
  ACCOUNT_STATUS_OPTIONS,
  ACCOUNT_TYPES,
  ACCOUNT_TYPE_OPTIONS,
} from "../constants";
import { useFinancialAccounts } from "../hooks/useFinancialAccounts";
import { createAccount } from "../services/financialService";
import { hasAccountErrors, validateAccountForm } from "../services/validators";
import { formatMoney } from "../utils/format";
import FinanceAccountForm from "./FinanceAccountForm";
import FinanceAccountList from "./FinanceAccountList";
import FinanceKpiCard from "./FinanceKpiCard";

const INITIAL_ACCOUNT_VALUES = {
  name: "",
  type: ACCOUNT_TYPES.CASH,
  currency: "PEN",
  opening_balance: "0",
  owner: "",
  branch: "",
  notes: "",
};

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

function CreateAccountDialog({ onClose, onCreated }) {
  const toast = useToast();

  const [values, setValues] = useState(INITIAL_ACCOUNT_VALUES);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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

    setIsSubmitting(true);

    try {
      await createAccount(buildAccountPayload(values));
      toast.success("Cuenta creada.");
      setIsSubmitting(false);
      onCreated();
      onClose();
    } catch (requestError) {
      setIsSubmitting(false);
      toast.error(requestError?.message ?? "No pudimos crear la cuenta.");
    }
  }

  function handleClose() {
    if (!isSubmitting) onClose();
  }

  return (
    <Modal
      open
      onClose={handleClose}
      title="Nueva cuenta financiera"
      description="Registra una caja, banco o billetera digital para controlar sus saldos."
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button variant="brand" loading={isSubmitting} onClick={handleSubmit}>
            Crear cuenta
          </Button>
        </>
      }
    >
      <FinanceAccountForm
        values={values}
        errors={errors}
        onChange={handleChange}
        onBlur={handleBlur}
        isLoading={isSubmitting}
      />
    </Modal>
  );
}

/**
 * Listado de cuentas financieras con indicadores, búsqueda y filtros.
 */
export default function FinanceAccountsView() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const {
    accounts,
    stats,
    filters,
    error,
    isLoading,
    isEmpty,
    updateFilter,
    resetFilters,
    refresh,
  } = useFinancialAccounts();

  const kpis = [
    {
      label: "Total de cuentas",
      value: stats?.total ?? 0,
      hint: "Cuentas registradas",
      icon: WalletCards,
      tone: "bg-[#EFF4FF] text-[#2E6BFF]",
    },
    {
      label: "Cajas",
      value: stats?.cash ?? 0,
      hint: "Fondos de efectivo",
      icon: Banknote,
      tone: "bg-[#F0FBF4] text-[#12A150]",
    },
    {
      label: "Bancos",
      value: stats?.bank ?? 0,
      hint: "Cuentas bancarias",
      icon: Landmark,
      tone: "bg-[#F3F7FF] text-[#1D4ED8]",
    },
    {
      label: "Billeteras digitales",
      value: stats?.digital_wallet ?? 0,
      hint: "Cobros y pagos móviles",
      icon: Smartphone,
      tone: "bg-[#F7F4FF] text-[#6941C6]",
    },
    {
      label: "Saldo total",
      value: formatMoney(stats?.total_balance ?? 0),
      hint: "Saldo de las cuentas activas",
      icon: CircleDollarSign,
      tone: "bg-[#FEF8EC] text-[#96590A]",
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Finanzas"
        title="Cuentas financieras"
        description="Administra tus cajas, cuentas bancarias y billeteras digitales, y controla sus saldos."
        actions={
          <Button variant="brand" onClick={() => setIsCreateOpen(true)}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Nueva cuenta
          </Button>
        }
      />

      {error ? <Alert variant="error">{error}</Alert> : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;

          return (
            <FinanceKpiCard
              key={kpi.label}
              label={kpi.label}
              value={kpi.value}
              hint={kpi.hint}
              icon={Icon}
              tone={kpi.tone}
              isLoading={isLoading}
            />
          );
        })}
      </div>

      <Card>
        <CardBody className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(280px,1.5fr)_minmax(180px,1fr)_minmax(180px,1fr)_auto] xl:items-end">
          <Input
            id="account-search"
            name="search"
            label="Buscar cuenta"
            placeholder="Busca por nombre, sucursal o responsable"
            value={filters.search ?? ""}
            onChange={(event) => updateFilter({ search: event.target.value })}
          />

          <Select
            id="account-type-filter"
            name="type"
            label="Tipo de cuenta"
            value={filters.type ?? ""}
            onChange={(event) => updateFilter({ type: event.target.value })}
            options={ACCOUNT_TYPE_OPTIONS}
            placeholder="Todos los tipos"
          />

          <Select
            id="account-status-filter"
            name="status"
            label="Estado"
            value={filters.status ?? ""}
            onChange={(event) => updateFilter({ status: event.target.value })}
            options={ACCOUNT_STATUS_OPTIONS}
            placeholder="Todos los estados"
          />

          <Button
            variant="outline"
            onClick={resetFilters}
            disabled={isLoading}
            className="xl:mb-[1px]"
          >
            Limpiar
          </Button>
        </CardBody>
      </Card>

      {isEmpty ? (
        <EmptyState
          icon={WalletCards}
          title="No hay cuentas que coincidan"
          description="Prueba a cambiar los filtros o registra una nueva cuenta para empezar."
          action={
            <Button variant="brand" onClick={() => setIsCreateOpen(true)}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              Nueva cuenta
            </Button>
          }
        />
      ) : (
        <FinanceAccountList accounts={accounts} isLoading={isLoading} />
      )}

      {isCreateOpen ? (
        <CreateAccountDialog
          onClose={() => setIsCreateOpen(false)}
          onCreated={refresh}
        />
      ) : null}
    </div>
  );
}
