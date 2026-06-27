import { useEffect, useRef } from "react";
import { CheckCircle2 } from "lucide-react";

interface SuccessModalProps {
  isOpen: boolean;
  title: string;
  message?: string;
  actionLabel?: string;
  onClose: () => void;
}

export function SuccessModal({
  isOpen,
  title,
  message,
  actionLabel = "Aceptar",
  onClose,
}: SuccessModalProps) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const titleId = "success-modal-title";
  const descId = "success-modal-desc";

  // Enfocar el botón cuando el modal se abre
  useEffect(() => {
    if (isOpen) {
      btnRef.current?.focus();
    }
  }, [isOpen]);

  // Cerrar con Escape
  useEffect(() => {
    if (!isOpen) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  // Bloquear scroll del body cuando está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      aria-modal="true"
      role="alertdialog"
      aria-labelledby={titleId}
      aria-describedby={message ? descId : undefined}
    >
      {/* Fondo oscuro */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel — bottom sheet en móvil, centrado en desktop */}
      <div className="relative w-full sm:max-w-sm sm:mx-4 bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden">
        {/* Franja verde superior */}
        <div className="bg-[#218a72] h-1.5 w-full" aria-hidden="true" />

        <div className="px-6 pt-7 pb-8 text-center">
          {/* Icono de éxito */}
          <div
            className="mx-auto w-16 h-16 rounded-full bg-[#218a72]/10 flex items-center justify-center mb-4"
            aria-hidden="true"
          >
            <CheckCircle2 size={36} className="text-[#218a72]" />
          </div>

          {/* Título */}
          <h2
            id={titleId}
            className="text-xl font-extrabold text-gray-900 mb-2"
          >
            {title}
          </h2>

          {/* Mensaje opcional */}
          {message && (
            <p
              id={descId}
              className="text-sm text-gray-600 mb-6"
            >
              {message}
            </p>
          )}

          {/* Región live para lectores de pantalla */}
          <div
            role="status"
            aria-live="polite"
            aria-atomic="true"
            className="sr-only"
          >
            {title}. {message ?? ""}
          </div>

          {/* Botón de confirmación */}
          <button
            ref={btnRef}
            type="button"
            onClick={onClose}
            className="w-full py-3.5 bg-[#218a72] hover:bg-[#1b6f5c] active:scale-[0.98] text-white rounded-xl font-bold transition-all focus:outline-none focus:ring-4 focus:ring-[#218a72]/30 mt-4"
          >
            {actionLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
