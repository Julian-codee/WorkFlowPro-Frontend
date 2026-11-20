"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Check, LoaderCircle, Save } from "lucide-react";

import { Alert, Button, Card, CardBody, CardFooter, PageHeader, useToast } from "@/components/ui";

import { useFinancialMovementForm } from "../hooks/useFinancialMovementForm";
import FinanceMovementForm from "./FinanceMovementForm";

/**
 * Alta de un movimiento financiero.
 *
 * Consume `POST /financial/movements`.
 */
export default function FinanceMovementCreateView() {
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
    submitMovement,
  } = useFinancialMovementForm({
    initialValues: { movement_date: new Date().toISOString().slice(0, 10) },
  });

  const handleTypeChange = (type) => {
    setFieldValue("type", type);
  };

  const handleSubmit = async () => {
    const saved = await submitMovement();

    if (saved) {
      toast.success("Movimiento registrado.");
      router.push(`/financials/movements/${saved.id}`);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Finanzas"
        title="Nuevo movimiento"
        description="Registra un ingreso o un egreso con su cuenta, categoría y método de pago."
        actions={
          <Button variant="outline" onClick={() => router.push("/financials/movements")}>
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Volver
          </Button>
        }
      />

      {formError ? <Alert variant="error">{formError}</Alert> : null}

      <Card>
        <CardBody className="pt-6">
          <FinanceMovementForm
            values={values}
            errors={errors}
            onChange={handleChange}
            onBlur={handleBlur}
            onTypeChange={handleTypeChange}
            isLoading={isLoading}
          />
        </CardBody>

        <CardFooter>
          <Button
            variant="ghost"
            onClick={() => router.push("/financials/movements")}
            disabled={isLoading}
          >
            Descartar
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
                Guardar movimiento
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      <p className="flex items-center gap-1.5 text-[11.5px] leading-5 text-[#94A3B8]">
        <Check className="h-3.5 w-3.5" aria-hidden="true" />
        El movimiento se guarda con la fecha de registro de hoy. Si la fecha elegida pertenece a una
        semana cerrada, quedará marcado como registro tardío.
      </p>
    </div>
  );
}
