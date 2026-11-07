"use client";

import Link from "next/link";
import { AlertTriangle, CheckCircle2, Search, TriangleAlert } from "lucide-react";

import { Alert, Badge, Button } from "@/components/ui";

import { getCustomerDisplayName } from "../constants";
import { useDuplicates } from "../hooks/useDuplicates";
import { CustomerStatusBadge, CustomerTypeBadge } from "./CustomerBadges";

/**
 * Verificación de duplicados antes de guardar un cliente.
 *
 * Consume `POST /customers/check-duplicates` (servicio ya preparado).
 */
export default function DuplicateCheckPanel({ values }) {
  const { status, result, error, isLoading, hasDuplicates, check, reset } = useDuplicates();

  const buildPayload = () => ({
    document_number: values.document_number ?? "",
    email: values.email ?? "",
    tax_id: values.tax_id ?? "",
    name:
      values.type === "legal"
        ? (values.business_name ?? "")
        : [values.first_name, values.last_name].filter(Boolean).join(" "),
  });

  return (
    <div className="rounded-2xl border border-dashed border-[#DCE3ED] bg-[#FBFCFE] p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[13px] font-semibold text-[#0B1220]">¿Ya existe este cliente?</p>
          <p className="mt-0.5 text-[12px] text-[#64748B]">
            Buscamos coincidencias por documento, correo, identificador fiscal y nombre.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {status !== "idle" ? (
            <Button variant="ghost" size="sm" onClick={reset} disabled={isLoading}>
              Limpiar
            </Button>
          ) : null}

          <Button
            variant="outline"
            size="sm"
            loading={isLoading}
            onClick={() => check(buildPayload())}
          >
            <Search className="h-3.5 w-3.5" aria-hidden="true" />
            Verificar duplicados
          </Button>
        </div>
      </div>

      {error ? (
        <Alert variant="error" className="mt-3">
          {error}
        </Alert>
      ) : null}

      {status === "success" && !hasDuplicates ? (
        <Alert variant="success" className="mt-3">
          <span className="inline-flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
            No encontramos clientes que coincidan con estos datos.
          </span>
        </Alert>
      ) : null}

      {status === "success" && hasDuplicates ? (
        <div className="mt-3 space-y-2">
          <Alert variant="warning" title="Posibles duplicados">
            <span className="inline-flex items-center gap-1.5">
              <TriangleAlert className="h-3.5 w-3.5" aria-hidden="true" />
              Encontramos {result.duplicates.length}{" "}
              {result.duplicates.length === 1 ? "cliente que coincide" : "clientes que coinciden"}.
              Revísalos antes de crear uno nuevo.
            </span>
          </Alert>

          <ul className="space-y-2">
            {result.duplicates.map((duplicate) => (
              <li
                key={duplicate.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#E6EBF3] bg-white px-3.5 py-3"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-[13px] font-semibold text-[#0B1220]">
                      {duplicate.name ?? getCustomerDisplayName(duplicate)}
                    </p>
                    <CustomerTypeBadge type={duplicate.type} />
                    <CustomerStatusBadge status={duplicate.status} />
                  </div>

                  <p className="mt-1 truncate text-[12px] text-[#64748B]">
                    {duplicate.email ?? "Sin correo"} · {duplicate.document_number ?? "—"}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Badge tone="warning">
                    <AlertTriangle className="h-3 w-3" aria-hidden="true" />
                Coincide por {duplicate.match_reason}
                  </Badge>

                  <Link
                    href={`/customers/${duplicate.id}`}
                    className="text-[12.5px] font-semibold text-[#2E6BFF] transition hover:text-[#1D4FD8]"
                  >
                    Ver ficha
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
