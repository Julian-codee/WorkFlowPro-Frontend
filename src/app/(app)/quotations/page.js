import QuotationsView from "@/features/quotations/components/QuotationsView";

// Estas pantallas resuelven sus datos en el cliente (servicios + hooks), por lo que
// la navegación no produce un shell instantáneo: se marca el segmento como bloqueante.
export const instant = false;

export const metadata = {
  title: "Cotizaciones · WorkFlowPro",
  description: "Gestiona las cotizaciones enviadas a tus clientes.",
};

export default function QuotationsPage() {
  return <QuotationsView />;
}
