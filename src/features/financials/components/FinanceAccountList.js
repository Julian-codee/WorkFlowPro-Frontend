"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Banknote, Wallet } from "lucide-react";

import { Badge, Skeleton } from "@/components/ui";

import { ACCOUNT_STATUSES, ACCOUNT_TYPES } from "../constants";
import { formatMoney } from "../utils/format";
import { AccountTypeBadge } from "./FinanceBadges";

function AccountSkeletonRows() {
  return Array.from({ length: 5 }).map((_, index) => (
    <tr key={index} className="border-t border-[#F1F4F9]">
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-9" />
          <div className="flex-1">
            <Skeleton className="h-4 w-[190px]" />
            <Skeleton className="mt-2 h-3 w-[140px]" />
          </div>
        </div>
      </td>
      <td className="px-5 py-4">
        <Skeleton className="h-5 w-[76px] rounded-full" rounded="rounded-full" />
      </td>
      <td className="px-5 py-4">
        <Skeleton className="h-4 w-[110px]" />
      </td>
      <td className="px-5 py-4">
        <Skeleton className="h-4 w-[100px]" />
      </td>
      <td className="px-5 py-4">
        <Skeleton className="h-4 w-[120px]" />
      </td>
      <td className="px-5 py-4">
        <Skeleton className="h-5 w-[70px] rounded-full" rounded="rounded-full" />
      </td>
      <td className="px-5 py-4">
        <Skeleton className="h-4 w-[76px]" />
      </td>
    </tr>
  ));
}

function AccountSkeletonCards() {
  return Array.from({ length: 3 }).map((_, index) => (
    <div key={index} className="rounded-2xl border border-[#E6EBF3] bg-white p-4">
      <div className="flex items-start gap-3">
        <Skeleton className="h-10 w-10" />
        <div className="min-w-0 flex-1">
          <Skeleton className="h-4 w-[75%]" />
          <Skeleton className="mt-2 h-3 w-[48%]" />
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <Skeleton className="h-12" />
        <Skeleton className="h-12" />
      </div>
    </div>
  ));
}

/**
 * Listado de cuentas financieras.
 *
 * Tabla en escritorio y tarjetas en móvil, con la misma información.
 */
export default function FinanceAccountList({ accounts = [], isLoading = false }) {
  const router = useRouter();

  if (isLoading) {
    return (
      <>
        <div className="hidden overflow-hidden rounded-2xl border border-[#E6EBF3] bg-white md:block">
          <table className="w-full border-collapse">
            <tbody>
              <AccountSkeletonRows />
            </tbody>
          </table>
        </div>

        <div className="grid gap-3 md:hidden">
          <AccountSkeletonCards />
        </div>
      </>
    );
  }

  return (
    <>
      {/* Escritorio */}
      <div className="hidden overflow-x-auto rounded-2xl border border-[#E6EBF3] bg-white md:block">
        <table className="w-full min-w-[980px] border-collapse">
          <thead>
            <tr className="bg-[#FAFBFD] text-left">
              <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-[#94A3B8]">
                Cuenta
              </th>
              <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-[#94A3B8]">
                Tipo
              </th>
              <th className="px-5 py-3 text-right text-[11px] font-bold uppercase tracking-[0.12em] text-[#94A3B8]">
                Saldo actual
              </th>
              <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-[#94A3B8]">
                Código
              </th>
              <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-[#94A3B8]">
                Descripción
              </th>
              <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-[#94A3B8]">
                Estado
              </th>
              <th className="px-5 py-3 text-right text-[11px] font-bold uppercase tracking-[0.12em] text-[#94A3B8]">
                Acciones
              </th>
            </tr>
          </thead>

          <tbody>
            {accounts.map((account) => {
              const AccountIcon = account.type === ACCOUNT_TYPES.CASH ? Banknote : Wallet;
              const isActive = account.status === ACCOUNT_STATUSES.ACTIVE;

              return (
                <tr
                  key={account.id}
                  className="group cursor-pointer border-t border-[#F1F4F9] transition hover:bg-[#FAFBFD]"
                  onClick={() => router.push(`/financials/accounts/${account.id}`)}
                >
                  <td className="max-w-[300px] px-5 py-4">
                    <div className="flex items-center gap-3">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#F7F9FC] text-[#64748B]">
                        <AccountIcon className="h-4 w-4" aria-hidden="true" />
                      </span>

                      <div className="min-w-0">
                        <Link
                          href={`/financials/accounts/${account.id}`}
                          onClick={(event) => event.stopPropagation()}
                          className="block truncate text-[13.5px] font-semibold text-[#0B1220] transition hover:text-[#2E6BFF]"
                        >
                          {account.name}
                        </Link>
                        <p className="mt-0.5 truncate text-[11.5px] text-[#94A3B8]">
                          {account.description || "Sin descripción"}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <AccountTypeBadge type={account.type} />
                  </td>

                  <td className="px-5 py-4 text-right text-[13.5px] font-semibold tabular-nums text-[#0B1220]">
                    {formatMoney(account.balance, account.currency)}
                  </td>

                  <td className="px-5 py-4 text-[12.5px] font-medium text-[#475569]">
                    {account.code || "—"}
                  </td>

                  <td className="max-w-[220px] px-5 py-4 text-[12.5px] text-[#475569]">
                    <span className="block truncate">{account.description || "—"}</span>
                  </td>

                  <td className="px-5 py-4">
                    <Badge tone={isActive ? "success" : "neutral"} dot>
                      {isActive ? "Activa" : "Archivada"}
                    </Badge>
                  </td>

                  <td className="px-5 py-4 text-right">
                    <Link
                      href={`/financials/accounts/${account.id}`}
                      onClick={(event) => event.stopPropagation()}
                      className="text-[12.5px] font-semibold text-[#2E6BFF] transition hover:text-[#2559E0]"
                    >
                      Ver detalle
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Móvil */}
      <div className="grid gap-3 md:hidden">
        {accounts.map((account) => {
          const AccountIcon = account.type === ACCOUNT_TYPES.CASH ? Banknote : Wallet;
          const isActive = account.status === ACCOUNT_STATUSES.ACTIVE;

          return (
            <Link
              key={account.id}
              href={`/financials/accounts/${account.id}`}
              className="rounded-2xl border border-[#E6EBF3] bg-white p-4 transition active:scale-[0.99]"
            >
              <div className="flex items-start gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#F7F9FC] text-[#64748B]">
                  <AccountIcon className="h-[18px] w-[18px]" aria-hidden="true" />
                </span>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13.5px] font-semibold leading-snug text-[#0B1220]">
                    {account.name}
                  </p>
                  <p className="mt-0.5 truncate text-[12px] text-[#94A3B8]">
                    {account.code || "Sin código"}
                  </p>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <AccountTypeBadge type={account.type} />
                <Badge tone={isActive ? "success" : "neutral"} dot>
                  {isActive ? "Activa" : "Archivada"}
                </Badge>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-[#FAFBFD] p-3">
                <div>
                  <p className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-[#94A3B8]">
                    Saldo actual
                  </p>
                  <p className="mt-1 text-[13.5px] font-semibold tabular-nums text-[#0B1220]">
                    {formatMoney(account.balance, account.currency)}
                  </p>
                </div>

                <div>
                  <p className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-[#94A3B8]">
                    Código
                  </p>
                  <p className="mt-1 text-[12.5px] font-medium text-[#475569]">
                    {account.code || "—"}
                  </p>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between gap-3 text-[12px]">
                <span className="truncate text-[#64748B]">
                  {account.description || "Sin descripción"}
                </span>
                <span className="shrink-0 font-semibold text-[#2E6BFF]">Ver detalle</span>
              </div>
            </Link>
          );
        })}
      </div>
    </>
  );
}
