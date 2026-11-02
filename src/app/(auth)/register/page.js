import { AuthBrandPanel, RegisterPanel } from "@/features/auth/components";

export const metadata = {
  title: "Crear cuenta",
  description: "Crea tu cuenta de WorkFlowPro y empieza a organizar tus proyectos.",
};

export default function RegisterPage() {
  return (
    <main className="h-[100dvh] overflow-hidden bg-[#F7F9FC] font-sans text-[#0B1220] antialiased">
      <div className="grid h-[100dvh] grid-cols-1 overflow-hidden lg:grid-cols-[1.05fr_1fr]">
        <AuthBrandPanel />
        <RegisterPanel />
      </div>
    </main>
  );
}
