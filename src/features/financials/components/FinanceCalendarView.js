"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarRange, Plus } from "lucide-react";

import { Alert, Button, Card, CardBody, PageHeader } from "@/components/ui";

import { buildMonthMatrix } from "../constants";
import { useFinancialCalendar } from "../hooks/useFinancialCalendar";
import { useFinancialOverview } from "../hooks/useFinancialOverview";
import { formatMoney } from "../utils/format";
import FinanceCalendarGrid from "./FinanceCalendarGrid";
import FinanceDayDetail from "./FinanceDayDetail";

const MONTH_OPTIONS = [
  { value: "1", label: "Enero" },
  { value: "2", label: "Febrero" },
  { value: "3", label: "Marzo" },
  { value: "4", label: "Abril" },
  { value: "5", label: "Mayo" },
  { value: "6", label: "Junio" },
  { value: "7", label: "Julio" },
  { value: "8", label: "Agosto" },
  { value: "9", label: "Septiembre" },
  { value: "10", label: "Octubre" },
  { value: "11", label: "Noviembre" },
  { value: "12", label: "Diciembre" },
];

/**
 * Calendario financiero mensual.
 *
 * Consume `GET /financial/calendar/{year}/{month}`.
 */
export default function FinanceCalendarView() {
  const router = useRouter();

  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [selectedDate, setSelectedDate] = useState(null);

  const { calendar, totals, error, isLoading } = useFinancialCalendar(year, month);
  const { overview } = useFinancialOverview();

  const weeks = useMemo(
    () => buildMonthMatrix({ year, month, summaries: calendar?.days ?? {} }),
    [calendar, month, year],
  );

  const dayMovements = useMemo(() => {
    if (!selectedDate) return [];

    return (calendar?.movements ?? []).filter(
      (movement) => movement.movement_date === selectedDate,
    );
  }, [calendar, selectedDate]);

  const years = useMemo(() => {
    const current = new Date().getFullYear();
    const list = [];

    for (let offset = -2; offset <= 2; offset += 1) {
      list.push({ value: String(current + offset), label: String(current + offset) });
    }

    return list;
  }, []);

  const handlePrevMonth = () => {
    setSelectedDate(null);

    if (month === 1) {
      setMonth(12);
      setYear((current) => current - 1);
      return;
    }

    setMonth((current) => current - 1);
  };

  const handleNextMonth = () => {
    setSelectedDate(null);

    if (month === 12) {
      setMonth(1);
      setYear((current) => current + 1);
      return;
    }

    setMonth((current) => current + 1);
  };

  const handleMonthChange = (value) => {
    setSelectedDate(null);
    setMonth(value);
  };

  const handleYearChange = (value) => {
    setSelectedDate(null);
    setYear(value);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Finanzas"
        title="Calendario financiero"
        description="Días con ingresos y egresos, organized en semanas de lunes a domingo con balance independiente."
        actions={
          <Button variant="brand" onClick={() => router.push("/financials/movements/new")}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Registrar movimiento
          </Button>
        }
      />

      {error ? <Alert variant="error">{error}</Alert> : null}

      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryCard
          label="Ingresos del mes"
          value={formatMoney(totals?.income ?? 0)}
          tone="text-[#0A6B3D]"
          isLoading={isLoading}
        />
        <SummaryCard
          label="Egresos del mes"
          value={formatMoney(totals?.expense ?? 0)}
          tone="text-[#B42318]"
          isLoading={isLoading}
        />
        <SummaryCard
          label="Balance del mes"
          value={formatMoney(totals?.balance ?? 0)}
          tone={(totals?.balance ?? 0) >= 0 ? "text-[#0A6B3D]" : "text-[#B42318]"}
          isLoading={isLoading}
        />
      </div>

      <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1.75fr)_minmax(0,1fr)] xl:items-start">
        <Card className="min-w-0">
          <CardBody className="min-w-0">
            <FinanceCalendarGrid
              weeks={weeks}
              year={year}
              month={month}
              selectedDate={selectedDate}
              onSelectDay={setSelectedDate}
              onPrevMonth={handlePrevMonth}
              onNextMonth={handleNextMonth}
              onMonthChange={handleMonthChange}
              onYearChange={handleYearChange}
              months={MONTH_OPTIONS}
              years={years}
            />
          </CardBody>
        </Card>

        <div className="min-w-0 space-y-4">
          <FinanceDayDetail
            date={selectedDate}
            movements={dayMovements}
            accounts={overview?.accounts ?? []}
            isLoading={isLoading}
          />

          <Card className="min-w-0">
            <CardBody>
              <div className="flex items-start gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#EFF4FF] text-[#2E6BFF]">
                  <CalendarRange className="h-4 w-4" aria-hidden="true" />
                </span>

                <div>
                  <p className="text-[12.5px] font-semibold text-[#334155]">
                    Reinicio semanal automático
                  </p>
                  <p className="mt-1 text-[12px] leading-5 text-[#64748B]">
                    Cada lunes los acumuladores de ingresos y egresos vuelven a cero. Los saldos de
                    las cuentas y el historial financiero se conservan.
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}

/** Tarjeta de resumen del mes. */
function SummaryCard({ label, value, tone, isLoading }) {
  return (
    <div className="rounded-2xl border border-[#E6EBF3] bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <p className="text-[12px] font-medium text-[#64748B]">{label}</p>
      <p className={`mt-1 text-[19px] font-bold leading-none tracking-[-0.02em] tabular-nums ${tone}`}>
        {value}
      </p>
      {isLoading ? <p className="mt-2 text-[11px] text-[#94A3B8]">Cargando…</p> : null}
    </div>
  );
}
