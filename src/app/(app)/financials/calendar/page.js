import FinanceCalendarView from "@/features/financials/components/FinanceCalendarView";

// Estas pantallas resuelven sus datos en el cliente (servicios + hooks), por lo que
// la navegación no produce un shell instantáneo: se marca el segmento como bloqueante.
export const instant = false;

export const metadata = {
  title: "Calendario financiero · WorkFlowPro",
  description: "Calendario mensual con ingresos, egresos y balance por día y por semana.",
};

export default function FinancialCalendarPage() {
  return <FinanceCalendarView />;
}
