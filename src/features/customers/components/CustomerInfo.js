"use client";

import {
  Briefcase,
  Building2,
  CalendarDays,
  Globe,
  Mail,
  MapPin,
  Phone,
  Tag,
  UserRound,
} from "lucide-react";

import { Badge, Card, CardBody, CardHeader } from "@/components/ui";
import { cn } from "@/lib/utils/cn";

import { getCustomerDisplayName, getDocumentTypeMeta } from "../constants";
import { formatDate, formatDateTime } from "../utils/format";

function InfoItem({ icon: Icon, label, value, mono = false, className = "" }) {
  return (
    <div className={cn("min-w-0", className)}>
      <dt className="flex items-center gap-1.5 text-[11.5px] font-semibold uppercase tracking-[0.12em] text-[#94A3B8]">
        {Icon ? <Icon className="h-3.5 w-3.5" aria-hidden="true" /> : null}
        {label}
      </dt>
      <dd
        className={
          mono
            ? "mt-1.5 font-mono text-[13px] text-[#334155]"
            : "mt-1.5 truncate text-[13.5px] text-[#334155]"
        }
      >
        {value || "—"}
      </dd>
    </div>
  );
}

/**
 * Ficha de datos de un cliente (solo lectura).
 *
 * Muestra los campos de persona natural o jurídica según el tipo.
 */
export default function CustomerInfo({ customer }) {
  if (!customer) return null;

  const isLegal = customer.type === "legal";

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader
          title="Identificación"
          description="Datos legales y documento de identidad del cliente."
        />

        <CardBody>
          <dl className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <InfoItem
              icon={isLegal ? Building2 : UserRound}
              label="Nombre"
              value={getCustomerDisplayName(customer)}
            />

            {isLegal ? (
              <>
                <InfoItem
                  icon={Briefcase}
                  label="Nombre comercial"
                  value={customer.business_name}
                />
                <InfoItem icon={Building2} label="Razón social" value={customer.legal_name} />
                <InfoItem icon={Tag} label="Identificador fiscal" value={customer.tax_id} mono />
                <InfoItem icon={Briefcase} label="Sector" value={customer.industry} />
                <InfoItem
                  icon={CalendarDays}
                  label="Constitución"
                  value={formatDate(customer.incorporation_date)}
                />
                <InfoItem icon={Globe} label="Sitio web" value={customer.website} />
              </>
            ) : (
              <>
                <InfoItem icon={UserRound} label="Nombre" value={customer.first_name} />
                <InfoItem icon={UserRound} label="Apellidos" value={customer.last_name} />
                <InfoItem
                  icon={CalendarDays}
                  label="Nacimiento"
                  value={formatDate(customer.birth_date)}
                />
              </>
            )}

            <InfoItem
              icon={Tag}
              label="Tipo de documento"
              value={getDocumentTypeMeta(customer.document_type).label}
            />

            <InfoItem icon={Tag} label="Nº de documento" value={customer.document_number} mono />
          </dl>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Contacto" description="Canales de comunicación con el cliente." />

        <CardBody>
          <dl className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <InfoItem icon={Mail} label="Correo" value={customer.email} />
            <InfoItem icon={Phone} label="Teléfono" value={customer.phone} />

            {isLegal ? (
              <>
                <InfoItem icon={UserRound} label="Contacto" value={customer.contact_name} />
                <InfoItem icon={Mail} label="Correo del contacto" value={customer.contact_email} />
                <InfoItem
                  icon={Phone}
                  label="Teléfono del contacto"
                  value={customer.contact_phone}
                />
              </>
            ) : null}
          </dl>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Ubicación" description="Dirección fiscal y de contacto." />

        <CardBody>
          <dl className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <InfoItem
              icon={MapPin}
              label="Dirección"
              value={customer.address}
              className="sm:col-span-2 lg:col-span-4"
            />
            <InfoItem icon={MapPin} label="Ciudad" value={customer.city} />
            <InfoItem icon={MapPin} label="Estado" value={customer.state} />
            <InfoItem icon={MapPin} label="País" value={customer.country} />
          </dl>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Registro" description="Trazabilidad del alta en el sistema." />

        <CardBody>
          <dl className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <InfoItem
              icon={CalendarDays}
              label="Creado"
              value={formatDateTime(customer.created_at)}
            />
            <InfoItem
              icon={CalendarDays}
              label="Actualizado"
              value={formatDateTime(customer.updated_at)}
            />

            <div className="min-w-0">
              <dt className="flex items-center gap-1.5 text-[11.5px] font-semibold uppercase tracking-[0.12em] text-[#94A3B8]">
                <Tag className="h-3.5 w-3.5" aria-hidden="true" />
                Etiquetas
              </dt>
              <dd className="mt-2 flex flex-wrap gap-1.5">
                {customer.tags?.length ? (
                  customer.tags.map((tag) => (
                    <Badge key={tag} tone="brand">
                      {tag}
                    </Badge>
                  ))
                ) : (
                  <span className="text-[13px] text-[#94A3B8]">Sin etiquetas</span>
                )}
              </dd>
            </div>
          </dl>
        </CardBody>
      </Card>
    </div>
  );
}
