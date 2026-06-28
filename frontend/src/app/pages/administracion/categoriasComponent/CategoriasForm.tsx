import { useState } from "react";
import { Plus } from "lucide-react";

interface Props {
  onCreate: (nombre: string) => Promise<void> | void;
}

export default function CategoriasForm({ onCreate }: Props) {
  const [nombre, setNombre] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nombre.trim()) return;

    setLoading(true);

    try {
      await onCreate(nombre.trim());
      setNombre("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5"
    >
      <h3 className="text-lg font-semibold">
        Nueva categoría
      </h3>

      <div>
        <label className="block text-sm font-medium mb-2">
          Nombre
        </label>

        <input
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Ej. Audio"
          className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#218a72]"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="flex items-center gap-2 bg-[#218a72] hover:bg-[#1b6f5c] text-white rounded-xl px-5 py-3 font-medium disabled:opacity-50"
      >
        <Plus size={18} />
        Crear categoría
      </button>
    </form>
  );
}