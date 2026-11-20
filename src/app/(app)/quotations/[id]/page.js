import QuotationDetailView from "@/features/quotations/components/QuotationDetailView";

// Estas pantallas resuelven sus datos en el cliente (servicios + hooks), por lo que
// la navegación no produce un shell instantáneo: se marca el segmento como bloqueante.
export const instant = false;

export const metadata = {
  title: "Detalle de cotización · WorkFlowPro",
  description: "Consulta y administra una cotización, sus ítems y su historial.",
};

export default async function QuotationDetailPage({ params }) {
  const { id } = await params;

  return <QuotationDetailView quotationId={id} />;
}
