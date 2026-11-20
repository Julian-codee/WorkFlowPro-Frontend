"use client";

import { useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, LoaderCircle, Save } from "lucide-react";

import { Alert, Button, Card, CardBody, CardFooter, PageHeader, useToast } from "@/components/ui";

import { buildQuotationPayload, useQuotationForm } from "../hooks/useQuotationForm";
import { useQuotationTotals } from "../hooks/useQuotationTotals";
import QuotationForm from "./QuotationForm";

/**
 * Alta de cotización.
 *
 * Consume:
 *   POST /quotations/calculate  → vista previa de totales
 *   POST /quotations/            → creación
 */
export default function QuotationCreateView() {
  const router = useRouter();
  const toast = useToast();

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
  } = useQuotationForm();

  const { totals, isCalculating, calculate, reset } = useQuotationTotals();

  /** Al seleccionar un cliente se sincronizan id, nombre, correo y tipo. */
  const handleCustomerChange = useCallback(
    (customer) => {
      setFieldValue("customer_id", customer.customer_id ?? "");
      setFieldValue("customer_name", customer.customer_name ?? "");
      setFieldValue("customer_email", customer.customer_email ?? "");
      setFieldValue("type", customer.type ?? values.type);
    },
    [setFieldValue, values.type],
  );

  /** Pide al backend el cálculo de totales sin guardar la cotización. */
  const handleCalculate = useCallback(async () => {
    const result = await calculate({
      items: buildQuotationPayload(values).items,
      currency: values.currency,
    });

    if (result) {
      toast.success("Totales calculados.");
    }
  }, [calculate, toast, values]);

  const handleSubmit = useCallback(async () => {
    const saved = await submitQuotation();

    if (saved) {
      toast.success("Cotización creada correctamente.");
      router.push(`/quotations/${saved.id}`);
    }
  }, [router, submitQuotation, toast]);

  const totalPreview = useMemo(() => totals ?? null, [totals]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Comercial"
        title="Nueva cotización"
        description="Selecciona al cliente, define el alcance y las líneas de la propuesta."
        actions={
          <Button variant="outline" onClick={() => router.push("/quotations")}>
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Volver
          </Button>
        }
      />

      {formError ? <Alert variant="error">{formError}</Alert> : null}

      <Card>
        <CardBody className="pt-6">
          <QuotationForm
            values={values}
            errors={errors}
            onChange={handleChange}
            onBlur={handleBlur}
            onCustomerChange={handleCustomerChange}
            onItemChange={setItemValue}
            onAddItem={addItem}
            onRemoveItem={removeItem}
            onCalculate={handleCalculate}
            totals={totalPreview}
            isCalculating={isCalculating}
            isLoading={isLoading}
          />
        </CardBody>

        <CardFooter>
          <Button
            variant="ghost"
            onClick={() => {
              reset();
              router.push("/quotations");
            }}
            disabled={isLoading}
          >
            Descartar
          </Button>

          <Button
            variant="outline"
            onClick={handleCalculate}
            loading={isCalculating}
            disabled={isLoading}
          >
            {!isCalculating ? (
              <Check className="h-4 w-4" aria-hidden="true" />
            ) : null}
            Calcular totales
          </Button>

          <Button loading={isLoading} disabled={isLoading} onClick={handleSubmit}>
            {isLoading ? (
              <>
                <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
                Guardando…
              </>
            ) : (
              <>
                <Save className="h-4 w-4" aria-hidden="true" />
                Guardar cotización
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      <p className="text-[11.5px] leading-5 text-[#94A3B8]">
        La cotización se creará en estado <strong className="text-[#64748B]">borrador</strong>. Podrás
        enviarla al cliente desde su ficha cuando esté lista.
      </p>
    </div>
  );
}
