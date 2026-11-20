import FinanceClosuresView from "@/features/financials/components/FinanceClosuresView";

export const instant = false;

export const metadata = {
  title: "Historial de cierres · WorkFlowPro",
  description: "Consulta los cierres de caja, saldos, diferencias y ajustes semanales.",
};

export default function FinancialClosuresPage() {
  return <FinanceClosuresView />;
}
