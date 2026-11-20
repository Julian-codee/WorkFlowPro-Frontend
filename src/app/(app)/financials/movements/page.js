import FinanceMovementsView from "@/features/financials/components/FinanceMovementsView";

// Estas pantallas resuelven sus datos en el cliente (servicios + hooks), por lo que
// la navegación no produce un shell instantáneo: se marca el segmento como bloqueante.
export const instant = false;

export const metadata = {
  title: "Movimientos · WorkFlowPro",
  description: "Registro de ingresos y egresos con filtros por fecha, cuenta y categoría.",
};

export default function FinancialMovementsPage() {
  return <FinanceMovementsView />;
}
