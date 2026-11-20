import FinanceMovementDetailView from "@/features/financials/components/FinanceMovementDetailView";

// Estas pantallas resuelven sus datos en el cliente (servicios + hooks), por lo que
// la navegación no produce un shell instantáneo: se marca el segmento como bloqueante.
export const instant = false;

export const metadata = {
  title: "Movimiento · WorkFlowPro",
  description: "Consulta, edita y elimina un movimiento financiero.",
};

export default async function FinancialMovementDetailPage({ params }) {
  const { id } = await params;

  return <FinanceMovementDetailView movementId={id} />;
}
