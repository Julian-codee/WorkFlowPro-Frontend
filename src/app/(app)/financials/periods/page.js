import FinancePeriodsView from "@/features/financials/components/FinancePeriodsView";

export const instant = false;

export const metadata = {
  title: "Períodos semanales · WorkFlowPro",
  description: "Resumen financiero semanal y comparación de períodos.",
};

export default function FinancialPeriodsPage() {
  return <FinancePeriodsView />;
}
