import CustomerDetailView from "@/features/customers/components/CustomerDetailView";

// Estas pantallas resuelven sus datos en el cliente (servicios + hooks), por lo que
// la navegación no produce un shell instantáneo: se marca el segmento como bloqueante.
export const instant = false;

export const metadata = {
  title: "Ficha de cliente · WorkFlowPro",
  description: "Consulta, edita y administra la ficha de un cliente.",
};

export default async function CustomerDetailPage({ params }) {
  const { id } = await params;

  return <CustomerDetailView customerId={id} />;
}
