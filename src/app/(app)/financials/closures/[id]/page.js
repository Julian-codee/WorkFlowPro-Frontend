import FinanceClosureDetailView from "@/features/financials/components/FinanceClosureDetailView";

export const instant = false;

export const metadata = {
  title: "Cierre de caja · WorkFlowPro",
  description: "Revisa el cierre semanal y administra sus ajustes posteriores.",
};

export default async function FinancialClosureDetailPage({ params }) {
  const { id } = await params;

  return <FinanceClosureDetailView closureId={id} />;
}
