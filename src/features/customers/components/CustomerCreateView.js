"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Check, LoaderCircle } from "lucide-react";

import { Alert, Button, Card, CardBody, CardFooter, CardHeader, PageHeader } from "@/components/ui";

import { useCustomerForm } from "../hooks/useCustomerForm";
import CustomerForm from "./CustomerForm";

/**
 * Pantalla de alta de cliente.
 *
 * El guardado llama a `createCustomer` (preparado para `POST /customers/`).
 * También puedes usar las variantes `createNaturalCustomer` y
 * `createLegalCustomer` según el tipo elegido.
 */
export default function CustomerCreateView() {
  const router = useRouter();

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
  } = useCustomerForm({ createWith: "generic" });

  const handleSubmit = async () => {
    const saved = await submitCustomer();

    if (saved) {
      router.push(`/customers/${saved.id}`);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        eyebrow="Alta"
        title="Registrar cliente"
        description="Crea la ficha del cliente con su identificación, contacto y ubicación."
        actions={
          <Button variant="outline" onClick={() => router.push("/customers")}>
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Volver
          </Button>
        }
      />

      {formError ? <Alert variant="error">{formError}</Alert> : null}
      {notice ? <Alert variant="success">{notice}</Alert> : null}

      <Card>
        <CardHeader title="Datos del cliente" />

        <CardBody>
          <CustomerForm
            values={values}
            errors={errors}
            onChange={handleChange}
            onBlur={handleBlur}
            onTypeChange={handleTypeChange}
            onSubmit={handleSubmit}
            isLoading={isLoading}
            isEditing={false}
            showDuplicateCheck
          />
        </CardBody>

        <CardFooter>
          <Button variant="outline" onClick={() => router.push("/customers")} disabled={isLoading}>
            Cancelar
          </Button>

          <Button loading={isLoading} disabled={isLoading} onClick={handleSubmit}>
            {isLoading ? (
              <>
                <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
                Guardando…
              </>
            ) : (
              <>
                <Check className="h-4 w-4" aria-hidden="true" />
                Crear cliente
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
