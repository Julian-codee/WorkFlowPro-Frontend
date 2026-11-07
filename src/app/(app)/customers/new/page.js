import CustomerCreateView from "@/features/customers/components/CustomerCreateView";

// Estas pantallas resuelven sus datos en el cliente (servicios + hooks), por lo que
// la navegación no produce un shell instantáneo: se marca el segmento como bloqueante.
export const instant = false;

export const metadata = {
  title: "Nuevo cliente · WorkFlowPro",
  description: "Registra un cliente natural o jurídico en el espacio de trabajo.",
};

export default function NewCustomerPage() {
  return <CustomerCreateView />;
}
