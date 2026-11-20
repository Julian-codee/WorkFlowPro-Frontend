import FinanceMovementCreateView from "@/features/financials/components/FinanceMovementCreateView";

// Estas pantallas resuelven sus datos en el cliente (servicios + hooks), por lo que
// la navegación no produce un shell instantáneo: se marca el segmento como bloqueante.
export const instant = false;

export const metadata = {
  title: "Nuevo movimiento · WorkFlowPro",
  description: "Registra un ingreso o un egreso en una cuenta financiera.",
};

export default function NewFinancialMovementPage() {
  return <FinanceMovementCreateView />;
}
