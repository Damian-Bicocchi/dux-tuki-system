import { useEffect, useRef } from "react";
import { XCircle } from "lucide-react";

interface FailureModalProps {
  isOpen: boolean;
  title: string;
  message?: string;
  actionLabel?: string;
  onClose: () => void;
}

export function FailureModal({
  isOpen,
  title,
  message,
  actionLabel = "Aceptar",
  onClose,
}: FailureModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  // Sincronizar el estado de React con la API nativa del Dialog
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      if (!dialog.open) {
        // showModal() activa el comportamiento modal nativo, focus trap y backdrop
        dialog.showModal(); 
      }
    } else {
      if (dialog.open) {
        dialog.close();
      }
    }
  }, [isOpen]);

  // Escuchar cuando el usuario cierra el modal de forma nativa (ej: presionando la tecla Escape)
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleClose = () => {
      onClose();
    };

    dialog.addEventListener("close", handleClose);
    return () => dialog.removeEventListener("close", handleClose);
  }, [onClose]);

  return (
    <dialog
      ref={dialogRef}
      role="alertdialog" /* Refuerza que es una alerta crítica que requiere acción inmediata */
      className="p-0 border-none rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-sm fixed bottom-0 sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2 m-0 sm:mx-auto bg-white backdrop:bg-black/50"
    >
      {/* Franja roja superior */}
      <div className="bg-red-600 h-1.5 w-full" aria-hidden="true" />

      <div className="px-6 pt-7 pb-8 text-center w-full">
        {/* Icono decorativo: aria-hidden evita que el lector intente describirlo o diga "imagen" */}
        <div
          className="mx-auto w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4"
          aria-hidden="true"
        >
          <XCircle size={36} className="text-red-600" />
        </div>

        {/* Título: El navegador lo lee automáticamente por el contexto de alertdialog y el foco inicial */}
        <h2 className="text-xl font-extrabold text-gray-900 mb-2">
          {title}
        </h2>

        {/* Mensaje opcional */}
        {message && (
          <p className="text-sm text-gray-600 mb-6">
            {message}
          </p>
        )}

        {/* Botón de confirmación */}
        <button
          type="button"
          onClick={onClose}
          className="w-full py-3.5 bg-red-600 hover:bg-red-700 active:scale-[0.98] text-white rounded-xl font-bold transition-all focus:outline-none focus:ring-4 focus:ring-red-600/30 mt-4"
        >
          {actionLabel}
        </button>
      </div>
    </dialog>
  );
}