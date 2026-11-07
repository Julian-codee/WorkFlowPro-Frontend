import CustomersView from "@/features/customers/components/CustomersView";

// Estas pantallas resuelven sus datos en el cliente (servicios + hooks), por lo que
// la navegación no produce un shell instantáneo: se marca el segmento como bloqueante.
export const instant = false;

export const metadata = {
  title: "Clientes · WorkFlowPro",
  description: "Listado, búsqueda y filtrado de clientes naturales y jurídicos.",
};

export default function CustomersPage() {
  return <CustomersView />;
}
