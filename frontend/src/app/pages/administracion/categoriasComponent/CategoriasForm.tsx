import { useState } from "react";
import { Plus } from "lucide-react";
import { SuccessModal } from "../../../components/SuccessModal";
import { FailureModal } from "../../../components/FailureModal";

// Definimos la interfaz para las props
interface CategoriasFormProps {
  onCategoriaCreada: () => Promise<void>;
}

export default function CategoriasForm({ onCategoriaCreada }: CategoriasFormProps) {
  const API_URL = "http://localhost:3001/api/categorias";
  const [nombre, setNombre] = useState("");
  const [loading, setLoading] = useState(false);
  
  const [showSuccess, setShowSuccess] = useState(false);
  const [showFailure, setShowFailure] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => { // Corregido React.SubmitEvent a React.FormEvent
    e.preventDefault();
    if (!nombre.trim()) return;

    setLoading(true);

    const nombreCapitalizado = nombre
      .trim()
      .toLowerCase()
      .split(" ")
      .map(palabra => palabra.charAt(0).toUpperCase() + palabra.slice(1))
      .join(" ");

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre: nombreCapitalizado }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "No se pudo crear la categoría.");
      }

      setNombre("");
      setShowSuccess(true);
      
      {/* 🚀 AQUÍ EJECUTAMOS EL REFRESH EN EL PADRE */}
      await onCategoriaCreada();

    } catch (error: any) {
      setErrorMessage(error.message || "Ocurrió un error inesperado.");
      setShowFailure(true);
    } finally {
      setLoading(false);
    }
  };


  return (
    <>
      <form
        onSubmit={handleSubmit}
        aria-labelledby="form-title"
        className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5"
      >
        <h3 id="form-title" className="text-lg font-semibold">
          Nueva categoría
        </h3>

        <div>
          <label 
            htmlFor="categoria-input" 
            className="block text-sm font-medium mb-2"
          >
            Nombre de la categoría
          </label>

          <input
            id="categoria-input"
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ej. Audio"
            required
            aria-required="true"
            aria-invalid={nombre.trim() === "" && loading}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#218a72]"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          aria-busy={loading}
          className="flex items-center gap-2 bg-[#218a72] hover:bg-[#1b6f5c] text-white rounded-xl px-5 py-3 font-medium disabled:opacity-50"
        >
          <Plus size={18} aria-hidden="true" />
          <span>{loading ? "Creando..." : "Crear categoría"}</span>
        </button>
      </form>

      {showSuccess && (
        <SuccessModal 
          isOpen={showSuccess} 
          title="¡Categoría creada con éxito!"
          message="La nueva categoría se ha guardado correctamente en el sistema y ya está disponible."
          onClose={() => setShowSuccess(false)} 
        />
      )}

      {/* CASO FALLIDO: Pasando title y description (dinámica) como props */}
      {showFailure && (
        <FailureModal 
          isOpen={showFailure} 
          title="Hubo un problema"
          message={errorMessage} 
          onClose={() => setShowFailure(false)} 
        />
      )}
    </>
  );
}