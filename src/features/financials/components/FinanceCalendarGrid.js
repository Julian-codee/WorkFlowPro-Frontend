"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button, Select } from "@/components/ui";

import { formatAmount, formatMoney, formatShortDate } from "../utils/format";

const WEEKDAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

/**
 * Calendario financiero mensual.
 *
 * Cada día muestra ingresos, egresos y balance; cada semana (lunes a domingo)
 * cierra con su propio acumulador, que se reinicia en cero el lunes.
 */
export default function FinanceCalendarGrid({
  weeks = [],
  year,
  month,
  selectedDate,
  onSelectDay,
  onPrevMonth,
  onNextMonth,
  onMonthChange,
  onYearChange,
  months = [],
  years = [],
}) {
  return (
    <div className="space-y-4">
      {/* Navegación */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onPrevMonth}
            aria-label="Mes anterior"
          >
            <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
          </Button>

          <p className="min-w-[150px] text-center text-[14px] font-semibold capitalize text-[#0B1220]">
            {new Intl.DateTimeFormat("es-ES", { month: "long", year: "numeric" }).format(
              new Date(year, month - 1, 1),
            )}
          </p>

          <Button
            variant="outline"
            size="sm"
            onClick={onNextMonth}
            aria-label="Mes siguiente"
          >
            <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Select
            id="calendar-month"
            name="month"
            label="Mes"
            value={String(month)}
            onChange={(event) => onMonthChange(Number(event.target.value))}
            options={months}
            className="w-[150px]"
          />

          <Select
            id="calendar-year"
            name="year"
            label="Año"
            value={String(year)}
            onChange={(event) => onYearChange(Number(event.target.value))}
            options={years}
            className="w-[110px]"
          />
        </div>
      </div>

      {/* Cabeceras de días */}
      <div className="overflow-x-auto">
        <div className="min-w-[620px]">
          <div className="grid grid-cols-[repeat(7,minmax(0,1fr))] gap-px overflow-hidden rounded-xl border border-[#E6EBF3] bg-[#E6EBF3]">
            {WEEKDAYS.map((day) => (
              <div
                key={day}
                className="bg-[#FAFBFD] px-2 py-2.5 text-center text-[10.5px] font-bold uppercase tracking-[0.12em] text-[#94A3B8]"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Semanas */}
          {weeks.map((week) => {
            const weekIncome = week.days.reduce((acc, day) => acc + day.income, 0);
            const weekExpense = week.days.reduce((acc, day) => acc + day.expense, 0);
            const weekBalance = weekIncome - weekExpense;

            return (
              <div key={week.key} className="mt-px overflow-hidden rounded-xl border border-[#E6EBF3]">
                <div className="grid grid-cols-[repeat(7,minmax(0,1fr))] gap-px bg-[#E6EBF3]">
                  {week.days.map((day) => (
                    <DayCell
                      key={day.date}
                      day={day}
                      currency="PEN"
                      isSelected={day.date === selectedDate}
                      onSelect={onSelectDay}
                    />
                  ))}
                </div>

                {/* Acumulador semanal: se reinicia en cero cada lunes */}
                <div className="flex flex-wrap items-center justify-between gap-3 bg-[#FBFCFE] px-4 py-2.5">
                  <p className="text-[11.5px] font-semibold text-[#475569]">
                    Semana {week.number}
                    <span className="ml-2 font-normal text-[#94A3B8]">
                      {formatShortDate(week.start)} – {formatShortDate(week.end)}
                    </span>
                  </p>

                  <div className="flex flex-wrap items-center gap-3 text-[11.5px] tabular-nums">
                    <span className="text-[#0A6B3D]">
                      Ingresos {formatMoney(weekIncome)}
                    </span>
                    <span className="text-[#B42318]">
                      Egresos {formatMoney(weekExpense)}
                    </span>
                    <span
                      className={`font-semibold ${
                        weekBalance >= 0 ? "text-[#0A6B3D]" : "text-[#B42318]"
                      }`}
                    >
                      Balance {formatMoney(weekBalance)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/** Celda de un día con sus ingresos, egresos y balance. */
function DayCell({ day, currency, isSelected, onSelect }) {
  const balance = day.income - day.expense;
  const hasMovements = day.count > 0;

  const details = hasMovements
    ? `${formatShortDate(day.date)} · Ingresos ${formatAmount(day.income)} · Egresos ${formatAmount(
        day.expense,
      )} · Balance ${formatAmount(balance)}`
    : `${formatShortDate(day.date)} · sin movimientos`;

  return (
    <button
      type="button"
      onClick={() => onSelect?.(day.date)}
      aria-pressed={isSelected}
      aria-label={`${formatShortDate(day.date)}${hasMovements ? ` · ${day.count} movimientos` : " · sin movimientos"}`}
      title={details}
      className={`min-h-[92px] min-w-0 bg-white p-2 text-left transition focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#2E6BFF] ${
        isSelected ? "bg-[#F4F7FF] ring-2 ring-inset ring-[#2E6BFF]" : "hover:bg-[#FBFCFE]"
      } ${day.isCurrentMonth ? "" : "opacity-45"}`}
    >
      <span
        className={`inline-grid h-6 min-w-6 place-items-center rounded-lg px-1.5 text-[12px] font-semibold ${
          day.isToday
            ? "bg-[#2E6BFF] text-white"
            : isSelected
              ? "bg-[#D6E2FB] text-[#2559E0]"
              : "text-[#475569]"
        }`}
      >
        {day.day}
      </span>

      {hasMovements ? (
        <span className="mt-2 block min-w-0 space-y-0.5">
          {day.income > 0 ? (
            <span className="block truncate text-[10.5px] font-semibold tabular-nums text-[#0A6B3D]">
              +{formatAmount(day.income, 0)}
            </span>
          ) : null}

          {day.expense > 0 ? (
            <span className="block truncate text-[10.5px] font-semibold tabular-nums text-[#B42318]">
              −{formatAmount(day.expense, 0)}
            </span>
          ) : null}

          <span
            className={`block truncate text-[10px] tabular-nums ${
              balance >= 0 ? "text-[#94A3B8]" : "text-[#D92D20]"
            }`}
          >
            {balance >= 0 ? "" : "−"}
            {formatAmount(Math.abs(balance), 0)} {currency}
          </span>
        </span>
      ) : (
        <span className="mt-2 block text-[10px] text-[#C3CCDA]">—</span>
      )}
    </button>
  );
}
