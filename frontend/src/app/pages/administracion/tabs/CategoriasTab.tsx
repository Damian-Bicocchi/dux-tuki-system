import { useEffect, useState } from "react";
import CategoriasForm from "../categoriasComponent/CategoriasForm";
import CategoriasList, {
  type Categoria,
} from "../categoriasComponent/CategoriasList";
import { getAuthHeaders } from "../../../../../../backend/utils/putHeaders";

export function CategoriasTab() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [cargandoPantalla, setCargandoPantalla] = useState(true);

  // Centralizamos la carga aquí
  async function cargarCategorias() {
    try {
      const res = await fetch("http://localhost:3001/api/categorias", {headers:getAuthHeaders()});
      if (!res.ok) {
        throw new Error("Error al obtener categorías");
      }
      const data = await res.json();
      setCategorias(data);
    } catch (err) {
      console.error(err);
    } finally {
      setCargandoPantalla(false);
    }
  }

  useEffect(() => {
    cargarCategorias();
  }, []);

  return (
    <div className="space-y-8">
      {/* Pasamos la función de recarga como prop */}
      <CategoriasForm onCategoriaCreada={cargarCategorias} />

      {/* Pasamos el estado de las categorías y la función para mutarlo al editar */}
      <CategoriasList 
        listaCategorias={categorias} 
        setListaCategorias={setCategorias} 
        cargandoPantalla={cargandoPantalla}
      />
    </div>
  );
}