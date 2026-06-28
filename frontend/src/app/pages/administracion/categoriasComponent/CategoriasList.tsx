import { useState } from "react";
import { Pencil, Check, X } from "lucide-react";

export interface Categoria {
  id: number;
  nombre: string;
}
const API_URL = "http://localhost:3001/api/categorias";

// Interfaz para recibir los datos del padre
interface CategoriasListProps {
  listaCategorias: Categoria[];
  setListaCategorias: React.Dispatch<React.SetStateAction<Categoria[]>>;
  cargandoPantalla: boolean;
}

export default function CategoriasList({ 
  listaCategorias, 
  setListaCategorias, 
  cargandoPantalla 
}: CategoriasListProps) {
  
  const [editando, setEditando] = useState<number | null>(null);
  const [nombre, setNombre] = useState("");
  const [guardando, setGuardando] = useState(false);

  const comenzarEdicion = (categoria: Categoria) => {
    setEditando(categoria.id);
    setNombre(categoria.nombre);
  };

  const guardar = async () => {
    if (!nombre.trim() || editando === null) return;

    setGuardando(true);
    try {
      const response = await fetch(`${API_URL}/${editando}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre: nombre.trim() }), 
      });

      if (!response.ok) throw new Error("Error al actualizar");

      setListaCategorias((prev) =>
        prev.map((cat) =>
          cat.id === editando ? { ...cat, nombre: nombre.trim() } : cat
        )
      );

      setEditando(null);
      setNombre("");
    } catch (error) {
      console.error("Error al guardar:", error);
      alert("No se pudo actualizar la categoría.");
    } finally {
      setGuardando(false);
    }
  };

  if (cargandoPantalla) {
    return <div className="p-8 text-center text-gray-500">Cargando categorías...</div>;
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl divide-y">
      {listaCategorias.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          No hay categorías registradas.
        </div>
      ) : (
        listaCategorias.map((categoria) => (
          <div
            key={categoria.id}
            className="flex items-center justify-between p-5"
          >
            {editando === categoria.id ? (
              <>
                <input
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="flex-1 border rounded-lg px-3 py-2 mr-4 disabled:bg-gray-100"
                  autoFocus
                  disabled={guardando}
                />

                <div className="flex gap-2">
                  <button
                    onClick={guardar}
                    className="text-green-600 hover:text-green-700 disabled:opacity-50"
                    disabled={guardando}
                  >
                    <Check size={20} />
                  </button>

                  <button
                    onClick={() => setEditando(null)}
                    className="text-red-600 hover:text-red-700 disabled:opacity-50"
                    disabled={guardando}
                  >
                    <X size={20} />
                  </button>
                </div>
              </>
            ) : (
              <>
                <span className="font-medium">{categoria.nombre}</span>

                <button
                  onClick={() => comenzarEdicion(categoria)}
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