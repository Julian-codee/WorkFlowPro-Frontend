"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Archive,
  ArrowLeft,
  Check,
  LoaderCircle,
  Pencil,
  PlayCircle,
  UserRoundCog,
} from "lucide-react";

import { Alert, Button, Card, CardBody, CardFooter, CardHeader, PageHeader, Tabs, useToast } from "@/components/ui";

import { CUSTOMER_STATUSES, getCustomerDisplayName } from "../constants";
import { useCustomer } from "../hooks/useCustomer";
import { useCustomerForm } from "../hooks/useCustomerForm";
import {
  archiveCustomer,
  reactivateCustomer,
  updateCustomerStatus,
} from "../services/customerService";
import ArchiveCustomerDialog from "./ArchiveCustomerDialog";
import CustomerAudit from "./CustomerAudit";
import { CustomerStatusBadge, CustomerTypeBadge } from "./CustomerBadges";
import CustomerFinancial from "./CustomerFinancial";
import CustomerForm from "./CustomerForm";
import CustomerInfo from "./CustomerInfo";
import CustomerNotes from "./CustomerNotes";
import CustomerStatusDialog from "./CustomerStatusDialog";

const TABS = [
  { id: "info", label: "Información" },
  { id: "notes", label: "Notas" },
  { id: "financial", label: "Financiero" },
  { id: "audit", label: "Auditoría" },
];

/**
 * Formulario de edición.
 * Se monta con `key={customer.id}` para inicializar los valores con los datos
 * que llegan del servidor (sin efectos de sincronización).
 */
function CustomerEditSection({ customer, onSaved, onCancel }) {
  const initialValues = useMemo(
    () => ({
      type: customer.type ?? "natural",
      first_name: customer.first_name ?? "",
      last_name: customer.last_name ?? "",
      business_name: customer.business_name ?? "",
      legal_name: customer.legal_name ?? "",
      tax_id: customer.tax_id ?? "",
      document_type: customer.document_type ?? "dni",
      document_number: customer.document_number ?? "",
      email: customer.email ?? "",
      phone: customer.phone ?? "",
      birth_date: customer.birth_date ?? "",
      incorporation_date: customer.incorporation_date ?? "",
      industry: customer.industry ?? "",
      website: customer.website ?? "",
      address: customer.address ?? "",
      city: customer.city ?? "",
      state: customer.state ?? "",
      country: customer.country ?? "",
      contact_name: customer.contact_name ?? "",
      contact_email: customer.contact_email ?? "",
      contact_phone: customer.contact_phone ?? "",
    }),
    [customer],
  );

  const {
    values,
    errors,
    formError,
    notice,
    isLoading,
    handleChange,
    handleBlur,
    handleTypeChange,
    submitCustomer,
  } = useCustomerForm({ initialValues, customerId: customer.id });

  const handleSave = async () => {
    const saved = await submitCustomer();

    if (saved) {
      onSaved(saved);
    }
  };

  return (
    <Card>
      <CardHeader
        title="Editar cliente"
        description="Actualiza los datos y guarda los cambios."
      />

      <CardBody className="space-y-5">
        {formError ? <Alert variant="error">{formError}</Alert> : null}
        {notice ? <Alert variant="success">{notice}</Alert> : null}

        <CustomerForm
          values={values}
          errors={errors}
          onChange={handleChange}
          onBlur={handleBlur}
          onTypeChange={handleTypeChange}
          onSubmit={handleSave}
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
              <Check className="h-4 w-4" aria-hidden="true" />
              Guardar cambios
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}

/**
 * Detalle de un cliente: ficha, notas, resumen financiero e historial.
 *
 * Carga con `GET /customers/{id}` y opera con:
 *   PATCH  /customers/{id}
 *   PATCH  /customers/{id}/status
 *   POST   /customers/{id}/reactivate
 *   DELETE /customers/{id}
 */
export default function CustomerDetailView({ customerId }) {
  const router = useRouter();
  const toast = useToast();

  const { customer, status, error, isLoading, setCustomer } = useCustomer(customerId);

  const [activeTab, setActiveTab] = useState("info");
  const [isEditing, setIsEditing] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);

  const handleOpenStatusDialog = () => {
    setSelectedStatus(customer.status);
    setIsStatusDialogOpen(true);
  };

  const handleStatusConfirm = async () => {
    if (!selectedStatus) return;

    setIsUpdating(true);

    try {
      const updated = await updateCustomerStatus(customer.id, selectedStatus);
      setCustomer(updated);
      setIsStatusDialogOpen(false);
      toast.success("Estado actualizado.");
    } catch (requestError) {
      toast.error(requestError?.message ?? "No pudimos actualizar el estado.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleArchive = async () => {
    setIsArchiving(true);

    try {
      const updated = await archiveCustomer(customer.id);
      setCustomer(updated);
      setIsArchiveOpen(false);
      toast.success("Cliente archivado.");
    } catch (requestError) {
      toast.error(requestError?.message ?? "No pudimos archivar el cliente.");
    } finally {
      setIsArchiving(false);
    }
  };

  const handleReactivate = async () => {
    setIsUpdating(true);

    try {
      const updated = await reactivateCustomer(customer.id);
      setCustomer(updated);
      toast.success("Cliente reactivado.");
    } catch (requestError) {
      toast.error(requestError?.message ?? "No pudimos reactivar el cliente.");
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Cliente" description="Cargando la información del cliente…" />
      </div>
    );
  }

  if (status === "error" || !customer) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <Alert variant="error">{error ?? "No encontramos el cliente solicitado."}</Alert>

        <Button variant="outline" onClick={() => router.push("/customers")}>
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Volver al listado
        </Button>
      </div>
    );
  }

  const isArchived = customer.status === CUSTOMER_STATUSES.ARCHIVED;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Ficha de cliente"
        title={getCustomerDisplayName(customer)}
        description={
          customer.email
            ? `${customer.email} · ${customer.document_number ?? customer.tax_id ?? "sin documento"}`
            : "Cliente sin datos de contacto"
        }
        actions={
          <>
            <Button variant="outline" onClick={() => router.push("/customers")}>
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Volver
            </Button>

            {isArchived ? (
              <Button variant="brand" loading={isUpdating} onClick={handleReactivate}>
                <PlayCircle className="h-4 w-4" aria-hidden="true" />
                Reactivar
              </Button>
            ) : (
              <Button variant="outline" onClick={() => setIsArchiveOpen(true)} disabled={isEditing}>
                <Archive className="h-4 w-4" aria-hidden="true" />
                Archivar
              </Button>
            )}

            <Button
              variant="outline"
              onClick={handleOpenStatusDialog}
              disabled={isEditing || isUpdating}
            >
              <UserRoundCog className="h-4 w-4" aria-hidden="true" />
              Cambiar estado
            </Button>

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
        <CustomerTypeBadge type={customer.type} />
        <CustomerStatusBadge status={customer.status} />

        {customer.tags?.map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-[#E2E8F0] bg-white px-2.5 py-1 text-[11.5px] font-medium text-[#475569]"
          >
            {tag}
          </span>
        ))}
      </div>

      {isEditing ? (
        <CustomerEditSection
          key={customer.id}
          customer={customer}
          onSaved={(saved) => {
            setCustomer(saved);
            setIsEditing(false);
            toast.success("Cliente actualizado.");
          }}
          onCancel={() => setIsEditing(false)}
        />
      ) : (
        <>
          <Tabs items={TABS} value={activeTab} onChange={setActiveTab} className="w-full" />

          {activeTab === "info" ? <CustomerInfo customer={customer} /> : null}
          {activeTab === "notes" ? <CustomerNotes customerId={customer.id} /> : null}
          {activeTab === "financial" ? <CustomerFinancial customerId={customer.id} /> : null}
          {activeTab === "audit" ? <CustomerAudit customerId={customer.id} /> : null}
        </>
      )}

      <CustomerStatusDialog
        open={isStatusDialogOpen}
        customer={customer}
        currentStatus={customer.status}
        selectedStatus={selectedStatus}
        onSelectStatus={setSelectedStatus}
        onConfirm={handleStatusConfirm}
        onClose={() => setIsStatusDialogOpen(false)}
        isUpdating={isUpdating}
      />

      <ArchiveCustomerDialog
        open={isArchiveOpen}
        customer={customer}
        isArchiving={isArchiving}
        onConfirm={handleArchive}
        onClose={() => setIsArchiveOpen(false)}
      />
    </div>
  );
}
