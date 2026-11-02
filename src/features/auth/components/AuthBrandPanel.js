import {
  ChartNoAxesColumn,
  Check,
  Globe,
  ListChecks,
  Pencil,
  Rocket,
  Star,
  TrendingUp,
} from "lucide-react";

/**
 * Panel de marca de la pantalla de inicio de sesión.
 *
 * Componente estático (sin estado): presenta la propuesta de valor y una
 * maqueta del producto. Todos los datos mostrados son ficticios y forman
 * parte de la vista previa del diseño.
 */

const FEATURES = [
  "Flujos simples y eficientes",
  "Colaboración en tiempo real",
  "Resultados que puedes medir",
];

const TASKS = [
  {
    icon: Pencil,
    title: "Revisión de estrategia",
    subtitle: "Producto · Equipo de producto",
    tag: "Urgente",
    tagClass: "bg-[#F59E0B]/15 text-[#FBBF24] border-[#F59E0B]/25",
    iconClass: "bg-[#2E6BFF]/20 text-[#7EA8FF]",
  },
  {
    icon: Rocket,
    title: "Preparar nuevo lanzamiento",
    subtitle: "Marketing · Campaña Q3",
    tag: "En curso",
    tagClass: "bg-[#2E6BFF]/15 text-[#8FB6FF] border-[#2E6BFF]/25",
    iconClass: "bg-[#12A150]/15 text-[#4ADE80]",
  },
  {
    icon: ChartNoAxesColumn,
    title: "Reporte de rendimiento",
    subtitle: "Finanzas · Operaciones",
    tag: "Semanal",
    tagClass: "bg-white/[0.06] text-[#9FB0CD] border-white/10",
    iconClass: "bg-[#8B5CF6]/20 text-[#C4B5FD]",
  },
];

const AVATARS = [
  { initials: "CC", className: "bg-[#F59E0B]" },
  { initials: "MM", className: "bg-[#8B5CF6]" },
  { initials: "DP", className: "bg-[#0EA5E9]" },
];

export default function AuthBrandPanel() {
  return (
    <aside className="relative hidden overflow-hidden bg-[#071227] text-white lg:flex lg:flex-col">
      {/* Decoración de fondo */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 -top-40 h-[560px] w-[560px] rounded-full bg-[#1D4ED8]/25 blur-[130px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 -right-24 h-[460px] w-[460px] rounded-full bg-[#2563EB]/20 blur-[120px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-[-140px] top-[80px] h-[420px] w-[420px] rounded-full border border-white/[0.06]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-[-60px] top-[160px] h-[280px] w-[280px] rounded-full border border-white/[0.05]"
      />

      <div className="relative z-10 flex h-full flex-col overflow-hidden px-10 py-[clamp(14px,2.2vh,28px)] xl:px-14">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#2E6BFF] shadow-[0_10px_24px_-8px_rgba(46,107,255,0.9)]">
            <ListChecks className="h-[19px] w-[19px] text-white" aria-hidden="true" />
          </span>
          <span className="text-[19px] font-bold tracking-[-0.01em]">
            WorkFlow<span className="text-[#5B93FF]">Pro</span>
          </span>
        </div>

        {/* Mensaje principal */}
        <div className="mt-[clamp(16px,4vh,54px)]">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#3B82F6]/25 bg-[#1E40AF]/20 px-3 py-1.5 text-[11px] font-medium text-[#A9C6FF]">
            <Globe className="h-3.5 w-3.5 text-[#5B93FF]" aria-hidden="true" />
            Trabajo inteligente, resultados reales
          </span>

          <h1 className="mt-[clamp(12px,1.9vh,22px)] text-[clamp(26px,4.4vh,44px)] font-bold leading-[1.05] tracking-[-0.025em]">
            <span className="block text-white">Todo tu trabajo.</span>
            <span className="block bg-gradient-to-r from-[#4D8DF7] via-[#6EA4FF] to-[#9CC0FF] bg-clip-text text-transparent">
              En perfecta sintonía.
            </span>
          </h1>

          <p className="mt-[clamp(10px,1.5vh,18px)] max-w-[460px] text-[clamp(12px,1.45vh,14.5px)] leading-[1.55] text-[#A3B5D4]">
            Planifica, colabora y haz que cada proyecto avance. WorkFlowPro reúne a tu equipo
            y tus objetivos en un solo lugar.
          </p>

          <ul className="mt-[clamp(10px,1.8vh,22px)] flex flex-wrap gap-x-6 gap-y-2">
            {FEATURES.map((feature) => (
              <li
                key={feature}
                className="flex items-center gap-2 text-[clamp(11px,1.3vh,12.5px)] text-[#C4D2EA]"
              >
                <span className="grid h-4 w-4 place-items-center rounded-full bg-[#2E6BFF]/25">
                  <Check className="h-2.5 w-2.5 text-[#7EA8FF]" aria-hidden="true" />
                </span>
                {feature}
              </li>
            ))}
          </ul>
        </div>

        {/* Maqueta del producto */}
        <div className="relative mt-[clamp(12px,2.6vh,32px)] w-full max-w-[450px] rounded-2xl border border-white/10 bg-white/[0.045] p-[clamp(10px,1.3vh,14px)] shadow-[0_40px_90px_-45px_rgba(0,0,0,0.95)] backdrop-blur-xl [@media(max-height:640px)]:hidden">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#7C90B5]">
                Espacio de trabajo
              </p>
              <p className="mt-1 text-[15px] font-semibold text-white">Panel de proyectos</p>
            </div>

            <div className="flex items-center -space-x-2">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-[#F59E0B] to-[#EA580C] text-[10px] font-bold text-white ring-2 ring-[#0C1B36]">
                AM
              </span>
              <span className="grid h-8 w-8 place-items-center rounded-full bg-[#2E6BFF] text-[10px] font-bold text-white ring-2 ring-[#0C1B36]">
                +1
              </span>
            </div>
          </div>

          <div className="mt-[clamp(10px,1.4vh,14px)] rounded-xl border border-white/[0.07] bg-white/[0.03] p-[clamp(8px,1vh,10px)]">
            <div className="flex items-center justify-between">
              <span className="text-[11.5px] text-[#9FB0CD]">Progreso semanal</span>
              <span className="text-[12.5px] font-semibold text-[#7EA8FF]">84%</span>
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
              <div className="h-full w-[84%] rounded-full bg-gradient-to-r from-[#2E6BFF] to-[#60A5FA]" />
            </div>
          </div>

          <ul className="mt-[clamp(8px,1.2vh,12px)] space-y-[clamp(4px,0.7vh,8px)]">
            {TASKS.map((task) => {
              const Icon = task.icon;
              return (
                <li
                  key={task.title}
                  className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.035] px-3 py-[clamp(5px,0.9vh,8px)]"
                >
                  <span
                    className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg ${task.iconClass}`}
                  >
                    <Icon className="h-[15px] w-[15px]" aria-hidden="true" />
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[12.5px] font-medium text-white">{task.title}</p>
                    <p className="truncate text-[10.5px] text-[#8095BC]">{task.subtitle}</p>
                  </div>

                  <span
                    className={`shrink-0 rounded-md border px-2 py-1 text-[9.5px] font-medium ${task.tagClass}`}
                  >
                    {task.tag}
                  </span>
                </li>
              );
            })}
          </ul>

          {/* Tarjeta flotante de productividad */}
          <div className="absolute -bottom-4 right-4 flex items-center gap-3 rounded-xl border border-white/10 bg-[#0D1D3A]/95 px-3.5 py-2 shadow-[0_20px_45px_-20px_rgba(0,0,0,0.9)] backdrop-blur-xl">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#2E6BFF]/20">
              <TrendingUp className="h-4 w-4 text-[#7EA8FF]" aria-hidden="true" />
            </span>
            <div>
              <p className="text-[9px] uppercase tracking-[0.14em] text-[#7C90B5]">Productividad</p>
              <p className="text-[15px] font-semibold leading-tight text-white">
                +24%{" "}
                <span className="text-[10px] font-normal text-[#8FA3C4]">este mes</span>
              </p>
            </div>
          </div>
        </div>

        {/* Prueba social */}
        <div className="mt-auto flex items-end justify-between gap-6 pt-[clamp(12px,2.4vh,32px)]">
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {AVATARS.map((avatar) => (
                <span
                  key={avatar.initials}
                  className={`grid h-8 w-8 place-items-center rounded-full text-[10px] font-bold text-white ring-2 ring-[#071227] ${avatar.className}`}
                >
                  {avatar.initials}
                </span>
              ))}
            </div>
            <p className="text-[10.5px] leading-[1.45] text-[#8FA3C4]">
              <span className="block text-[11.5px] font-semibold text-white">+15.000 equipos</span>
              ya descargan WorkFlowPro
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, index) => (
                <Star
                  key={index}
                  className="h-3.5 w-3.5 fill-[#5B93FF] text-[#5B93FF]"
                  aria-hidden="true"
                />
              ))}
            </div>
            <span className="text-[10.5px] font-medium text-[#8FA3C4]">4.8/5</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
