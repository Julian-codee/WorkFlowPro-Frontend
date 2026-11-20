import FinanceAccountsView from "@/features/financials/components/FinanceAccountsView";

export const instant = false;

export const metadata = {
  title: "Cuentas financieras · WorkFlowPro",
  description: "Administra cajas, bancos y billeteras digitales.",
};

export default function FinancialAccountsPage() {
  return <FinanceAccountsView />;
}
