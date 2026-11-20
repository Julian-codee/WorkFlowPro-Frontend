import FinanceAccountDetailView from "@/features/financials/components/FinanceAccountDetailView";

export const instant = false;

export const metadata = {
  title: "Detalle de cuenta · WorkFlowPro",
  description: "Consulta los saldos y movimientos de una cuenta.",
};

export default async function FinancialAccountDetailPage({ params }) {
  const { id } = await params;

  return <FinanceAccountDetailView accountId={id} />;
}
