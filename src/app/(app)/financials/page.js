import FinanceDashboardView from "@/features/financials/components/FinanceDashboardView";

// Estas pantallas resuelven sus datos en el cliente (servicios + hooks), por lo que
// la navegación no produce un shell instantáneo: se marca el segmento como bloqueante.
export const instant = false;

export const metadata = {
  title: "Finanzas · WorkFlowPro",
  description: "Dashboard financiero: ingresos, egresos, flujo neto y saldo disponible.",
};

export default function FinancialDashboardPage() {
  return <FinanceDashboardView />;
}
