import QuotationCreateView from "@/features/quotations/components/QuotationCreateView";

// Estas pantallas resuelven sus datos en el cliente (servicios + hooks), por lo que
// la navegación no produce un shell instantáneo: se marca el segmento como bloqueante.
export const instant = false;

export const metadata = {
  title: "Nueva cotización · WorkFlowPro",
  description: "Crea una cotización para un cliente natural o jurídico.",
};

export default function NewQuotationPage() {
  return <QuotationCreateView />;
}
