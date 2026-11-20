"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  Copy,
  CheckCircle2,
  LoaderCircle,
  Pencil,
  Send,
  Share2,
  XCircle,
} from "lucide-react";

import {
  Alert,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  PageHeader,
  Tabs,
  useToast,
} from "@/components/ui";

import { getQuotationActions } from "../constants";
import { useQuotation } from "../hooks/useQuotation";
import { useQuotationForm } from "../hooks/useQuotationForm";
import {
  acceptQuotation,
  duplicateQuotation,
  convertQuotationToTask,
  rejectQuotation,
  sendQuotation,
} from "../services/quotationService";
import {
  AcceptQuotationDialog,
  ConvertToTaskDialog,
  DuplicateQuotationDialog,
  RejectQuotationDialog,
  SendQuotationDialog,
} from "./QuotationActionDialogs";
import { QuotationStatusBadge, QuotationTypeBadge } from "./QuotationBadges";
import QuotationFinancial from "./QuotationFinancial";
import QuotationForm from "./QuotationForm";
import QuotationHistory from "./QuotationHistory";
import QuotationInfo from "./QuotationInfo";
import QuotationItems from "./QuotationItems";

const TABS = [
  { id: "detail", label: "Detalle" },
  { id: "items", label: "Ítems" },
  { id: "financial", label: "Financiero" },
  { id: "history", label: "Historial" },
];

/**
 * Formulario de edición de la cotización.
 * Se monta con `key={quotation.id}` para inicializar los valores con los datos
 * que llegan del servidor (sin efectos de sincronización).
 */
function QuotationEditSection({ quotation, onSaved, onCancel }) {
  const initialValues = useMemo(
    () => ({
      type: quotation.type ?? "natural",
      customer_id: quotation.customer_id ?? "",
      customer_name: quotation.customer_name ?? "",
      customer_email: quotation.customer_email ?? "",
      title: quotation.title ?? "",
      currency: quotation.currency ?? "USD",
      valid_until: quotation.valid_until ?? "",
      notes: quotation.notes ?? "",
      payment_terms: quotation.payment_terms ?? "",
      items: (quotation.items ?? []).map((item) => ({ ...item })),
    }),
    [quotation],
  );

  const {
    values,
    errors,
    formError,
    isLoading,
    handleChange,
    handleBlur,
    setFieldValue,
    setItemValue,
    addItem,
    removeItem,
    submitQuotation,
  } = useQuotationForm({ initialValues, quotationId: quotation.id });

  const handleSave = useCallback(async () => {
    const saved = await submitQuotation();

    if (saved) onSaved(saved);
  }, [onSaved, submitQuotation]);

  const handleCustomerChange = useCallback(
    (customer) => {
      setFieldValue("customer_id", customer.customer_id ?? "");
      setFieldValue("customer_name", customer.customer_name ?? "");
      setFieldValue("customer_email", customer.customer_email ?? "");
      setFieldValue("type", customer.type ?? values.type);
    },
    [setFieldValue, values.type],
  );

  return (
    <Card>
      <CardHeader title="Editar cotización" description="Actualiza los datos y guarda los cambios." />

      <CardBody className="pt-6">
        {formError ? <Alert variant="error">{formError}</Alert> : null}

        <QuotationForm
          values={values}
          errors={errors}
          onChange={handleChange}
          onBlur={handleBlur}
          onCustomerChange={handleCustomerChange}
          onItemChange={setItemValue}
          onAddItem={addItem}
          onRemoveItem={removeItem}
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
 * Detalle de una cotización.
 *
 * Consume:
 *   GET  /quotations/{id}            → datos de la cabecera
 *   GET  /quotations/{id}/full       → historial
 *   GET  /quotations/{id}/financial  → resumen financiero
 *   PATCH /quotations/{id}           → edición (solo borrador)
 *   POST /quotations/{id}/send|accept|reject|duplicate|convert-to-task
 *   POST /quotations/{id}/items
 *   PATCH|DELETE /quotations/{id}/items/{item_id}
 */
export default function QuotationDetailView({ quotationId }) {
  const router = useRouter();
  const toast = useToast();

  const { quotation, status, error, isLoading, setQuotation } = useQuotation(quotationId);

  const [activeTab, setActiveTab] = useState("detail");
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dialog, setDialog] = useState(null);

  const actions = getQuotationActions(quotation?.status);

  const closeDialog = useCallback(() => {
    setDialog(null);
  }, []);

  const handleSend = async () => {
    setIsSubmitting(true);

    try {
      const updated = await sendQuotation(quotation.id);
      setQuotation(updated);
      closeDialog();
      toast.success("Cotización enviada.");
    } catch (requestError) {
      toast.error(requestError?.message ?? "No pudimos enviar la cotización.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAccept = async () => {
    setIsSubmitting(true);

    try {
      const updated = await acceptQuotation(quotation.id);
      setQuotation(updated);
      closeDialog();
      toast.success("Cotización aceptada.");
    } catch (requestError) {
      toast.error(requestError?.message ?? "No pudimos aceptar la cotización.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async (reason) => {
    setIsSubmitting(true);

    try {
      const updated = await rejectQuotation(quotation.id, { reason });
      setQuotation(updated);
      closeDialog();
      toast.success("Cotización rechazada.");
    } catch (requestError) {
      toast.error(requestError?.message ?? "No pudimos rechazar la cotización.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDuplicate = async () => {
    setIsSubmitting(true);

    try {
      const duplicated = await duplicateQuotation(quotation.id);
      closeDialog();
      toast.success("Cotización duplicada.");
      router.push(`/quotations/${duplicated.id}`);
    } catch (requestError) {
      toast.error(requestError?.message ?? "No pudimos duplicar la cotización.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConvert = async () => {
    setIsSubmitting(true);

    try {
      const task = await convertQuotationToTask(quotation.id, {
        title: quotation.title,
        description: quotation.notes,
      });

      closeDialog();
      toast.success(`Tarea creada: ${task.title}`);
    } catch (requestError) {
      toast.error(requestError?.message ?? "No pudimos convertir la cotización en tarea.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Cotización" description="Cargando la información de la cotización…" />
      </div>
    );
  }

  if (status === "error" || !quotation) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <Alert variant="error">{error ?? "No encontramos la cotización solicitada."}</Alert>

        <Button variant="outline" onClick={() => router.push("/quotations")}>
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Volver al listado
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Cotización"
        title={quotation.title}
        description={`${quotation.number} · ${quotation.customer_name ?? "Sin cliente"}`}
        actions={
          <>
            <Button variant="outline" onClick={() => router.push("/quotations")}>
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Volver
            </Button>

            {actions.canDuplicate ? (
              <Button variant="outline" onClick={() => setDialog("duplicate")} disabled={isEditing}>
                <Copy className="h-4 w-4" aria-hidden="true" />
                Duplicar
              </Button>
            ) : null}

            {actions.canConvert ? (
              <Button variant="outline" onClick={() => setDialog("convert")} disabled={isEditing}>
                <Share2 className="h-4 w-4" aria-hidden="true" />
                Convertir en tarea
              </Button>
            ) : null}

            {actions.canReject ? (
              <Button variant="dangerGhost" onClick={() => setDialog("reject")} disabled={isEditing}>
                <XCircle className="h-4 w-4" aria-hidden="true" />
                Rechazar
              </Button>
            ) : null}

            {actions.canAccept ? (
              <Button variant="brand" onClick={() => setDialog("accept")} disabled={isEditing}>
                <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                Aceptar
              </Button>
            ) : null}

            {actions.canSend ? (
              <Button variant="brand" onClick={() => setDialog("send")} disabled={isEditing}>
                <Send className="h-4 w-4" aria-hidden="true" />
                Enviar
              </Button>
            ) : null}

            {actions.canEdit && !isEditing ? (
              <Button variant="primary" onClick={() => setIsEditing(true)}>
                <Pencil className="h-4 w-4" aria-hidden="true" />
                Editar
              </Button>
            ) : null}
          </>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <QuotationTypeBadge type={quotation.type} />
        <QuotationStatusBadge status={quotation.status} />

        <span className="rounded-full border border-[#E2E8F0] bg-white px-2.5 py-1 text-[11.5px] font-medium text-[#475569]">
          {quotation.currency}
        </span>
      </div>

      {isEditing ? (
        <QuotationEditSection
          key={quotation.id}
          quotation={quotation}
          onSaved={(saved) => {
            setQuotation(saved);
            setIsEditing(false);
            toast.success("Cotización actualizada.");
          }}
          onCancel={() => setIsEditing(false)}
        />
      ) : (
        <>
          <Tabs items={TABS} value={activeTab} onChange={setActiveTab} className="w-full" />

          {activeTab === "detail" ? <QuotationInfo quotation={quotation} /> : null}
          {activeTab === "items" ? (
            <QuotationItems
              quotationId={quotation.id}
              currency={quotation.currency}
              onQuotationChange={setQuotation}
            />
          ) : null}
          {activeTab === "financial" ? (
            <QuotationFinancial
              quotationId={quotation.id}
              total={quotation.total}
              currency={quotation.currency}
            />
          ) : null}
          {activeTab === "history" ? <QuotationHistory quotationId={quotation.id} /> : null}
        </>
      )}

      <SendQuotationDialog
        open={dialog === "send"}
        quotation={quotation}
        onClose={closeDialog}
        onConfirm={handleSend}
        isSubmitting={isSubmitting}
      />

      <AcceptQuotationDialog
        open={dialog === "accept"}
        quotation={quotation}
        onClose={closeDialog}
        onConfirm={handleAccept}
        isSubmitting={isSubmitting}
      />

      <RejectQuotationDialog
        key={dialog === "reject" ? "reject-open" : "reject-closed"}
        open={dialog === "reject"}
        quotation={quotation}
        onClose={closeDialog}
        onConfirm={handleReject}
        isSubmitting={isSubmitting}
        initialReason={quotation.rejection_reason ?? ""}
      />

      <DuplicateQuotationDialog
        open={dialog === "duplicate"}
        quotation={quotation}
        onClose={closeDialog}
        onConfirm={handleDuplicate}
        isSubmitting={isSubmitting}
      />

      <ConvertToTaskDialog
        open={dialog === "convert"}
        quotation={quotation}
        onClose={closeDialog}
        onConfirm={handleConvert}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
