import { useState } from "react";
import { Pencil, Check, X } from "lucide-react";

export interface Categoria {
  id: number;
  nombre: string;
}

interface Props {
  categorias: Categoria[];
  onUpdate: (
    id: number,
    nombre: string
  ) => Promise<void> | void;
}

export default function CategoriasList({
  categorias,
  onUpdate,
}: Props) {
  const [editando, setEditando] = useState<number | null>(null);
  const [nombre, setNombre] = useState("");

  const comenzarEdicion = (categoria: Categoria) => {
    setEditando(categoria.id);
    setNombre(categoria.nombre);
  };

  const guardar = async () => {
    if (!nombre.trim() || editando === null) return;

    await onUpdate(editando, nombre.trim());

    setEditando(null);
    setNombre("");
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl divide-y">
      {categorias.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          No hay categorías registradas.
        </div>
      ) : (
        categorias.map((categoria) => (
          <div
            key={categoria.id}
            className="flex items-center justify-between p-5"
          >
            {editando === categoria.id ? (
              <>
                <input
                  value={nombre}
                  onChange={(e) =>
                    setNombre(e.target.value)
                  }
                  className="flex-1 border rounded-lg px-3 py-2 mr-4"
                  autoFocus
                />

                <div className="flex gap-2">
                  <button
                    onClick={guardar}
                    className="text-green-600 hover:text-green-700"
                  >
                    <Check size={20} />
                  </button>

                  <button
                    onClick={() => setEditando(null)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X size={20} />
                  </button>
                </div>
              </>
            ) : (
              <>
                <span className="font-medium">
                  {categoria.nombre}
                </span>

                <button
                  onClick={() =>
                    comenzarEdicion(categoria)
                  }
                  className="text-gray-500 hover:text-[#218a72]"
                >
                  <Pencil size={18} />
                </button>
              </>
            )}
          </div>
        ))
      )}
    </div>
  );
}