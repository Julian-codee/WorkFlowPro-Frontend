import { AuthBrandPanel, LoginPanel } from "@/features/auth/components";

export const metadata = {
  title: "Iniciar sesión",
  description:
    "Accede a tu cuenta de WorkFlowPro y retoma tus proyectos donde los dejaste.",
};

export default function LoginPage() {
  return (
    <main className="h-[100dvh] overflow-hidden bg-[#F7F9FC] font-sans text-[#0B1220] antialiased">
      <div className="grid h-[100dvh] grid-cols-1 overflow-hidden lg:grid-cols-[1.05fr_1fr]">
        <AuthBrandPanel />
        <LoginPanel />
      </div>
    </main>
  );
}
