"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { CircleCheckBig, Info, TriangleAlert, X } from "lucide-react";

import { cn } from "@/lib/utils/cn";

/**
 * Sistema de notificaciones (toasts) del design system.
 *
 * Uso:
 *   <ToastProvider>
 *     ...
 *   </ToastProvider>
 *
 *   const toast = useToast();
 *   toast.success("Guardado correctamente");
 */

const ToastContext = createContext(null);

const VARIANTS = {
  info: { wrapper: "border-[#CDDFFC] bg-white text-[#1D4ED8]", icon: Info },
  success: { wrapper: "border-[#CDEBD8] bg-white text-[#0A6B3D]", icon: CircleCheckBig },
  warning: { wrapper: "border-[#F7E3BF] bg-white text-[#96590A]", icon: TriangleAlert },
  error: { wrapper: "border-[#F4C7CA] bg-white text-[#B42318]", icon: TriangleAlert },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const push = useCallback(
    (variant, message, { duration = 4500 } = {}) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setToasts((current) => [...current, { id, variant, message }]);

      if (duration > 0) {
        setTimeout(() => dismiss(id), duration);
      }

      return id;
    },
    [dismiss],
  );

  const value = useMemo(
    () => ({
      info: (message, options) => push("info", message, options),
      success: (message, options) => push("success", message, options),
      warning: (message, options) => push("warning", message, options),
      error: (message, options) => push("error", message, options),
      dismiss,
    }),
    [push, dismiss],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}

      <div className="pointer-events-none fixed bottom-4 right-4 z-[60] flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-2.5">
        {toasts.map((toast) => {
          const config = VARIANTS[toast.variant] ?? VARIANTS.info;
          const Icon = config.icon;

          return (
            <div
              key={toast.id}
              role="status"
              className={cn(
                "pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3 text-[12.5px] leading-5 shadow-[0_18px_40px_-20px_rgba(11,18,32,0.45)]",
                config.wrapper,
              )}
            >
              <Icon className="mt-px h-4 w-4 shrink-0" aria-hidden="true" />

              <p className="min-w-0 flex-1 text-[#334155]">{toast.message}</p>

              <button
                type="button"
                onClick={() => dismiss(toast.id)}
                aria-label="Cerrar notificación"
                className="shrink-0 text-[#94A3B8] transition hover:text-[#475569]"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast debe usarse dentro de un <ToastProvider>");
  }

  return context;
}
