/**
 * Botón de acceso con proveedor externo (Google).
 * La acción se delega al componente padre: este botón no gestiona estado.
 */
export default function SocialAuthButton({
  provider = "google",
  label = "Continuar con Google",
  onClick,
  disabled = false,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex h-[clamp(42px,5.2vh,48px)] w-full items-center justify-center gap-2.5 rounded-xl border border-[#E2E8F0] bg-white text-[14px] font-semibold text-[#1E293B] shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition hover:border-[#CBD5E1] hover:bg-[#FAFBFD] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2E6BFF] disabled:cursor-not-allowed disabled:opacity-60"
    >
      <GoogleMark className="h-[18px] w-[18px]" />
      {label}
    </button>
  );
}

function GoogleMark({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" focusable="false">
      <path
        fill="#4285F4"
        d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.63h6.46a5.52 5.52 0 0 1-2.4 3.62v3h3.88c2.27-2.09 3.58-5.17 3.58-8.8Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.08 7.94-2.91l-3.88-3.01c-1.08.72-2.45 1.15-4.06 1.15-3.13 0-5.78-2.11-6.73-4.95H1.25v3.09A12 12 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.28a7.2 7.2 0 0 1 0-4.56V6.63H1.25a12 12 0 0 0 0 10.74l4.02-3.09Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.43-3.43C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.25 6.63l4.02 3.09C6.22 6.86 8.87 4.75 12 4.75Z"
      />
    </svg>
  );
}
