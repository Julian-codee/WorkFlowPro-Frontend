import FinancePeriodDetailView from "@/features/financials/components/FinancePeriodDetailView";

export const instant = false;

export const metadata = {
  title: "Período semanal · WorkFlowPro",
  description: "Revisa los movimientos y cierra la caja de la semana.",
};

export default async function FinancialPeriodDetailPage({ params }) {
  const { id } = await params;

  return <FinancePeriodDetailView periodId={id} />;
}
