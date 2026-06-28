import { useEffect, useState } from "react";
import CategoriasForm from "../categoriasComponent/CategoriasForm";
import CategoriasList, {
  type Categoria,
} from "../categoriasComponent/CategoriasList";

export function CategoriasTab() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);

  useEffect(() => {
    cargarCategorias();
  }, []);

  async function cargarCategorias() {
    try {
      const res = await fetch("http://localhost:3001/api/categorias");

      if (!res.ok) {
        throw new Error("Error al obtener categorías");
      }

      const data = await res.json();
      setCategorias(data);
    } catch (err) {
      console.error(err);
    }
  }

  async function crearCategoria(nombre: string) {
    try {
      const res = await fetch("http://localhost:3001/api/categorias", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombre,
          descripcion: "",
        }),
      });

      if (!res.ok) {
        throw new Error("Error al crear categoría");
      }

      await cargarCategorias();
    } catch (err) {
      console.error(err);
    }
  }

  async function editarCategoria(id: number, nombre: string) {
    try {
      const res = await fetch(
        `http://localhost:3001/api/categorias/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nombre,
            descripcion: "",
          }),
        }
      );

      if (!res.ok) {
        throw new Error("Error al editar categoría");
      }

      await cargarCategorias();
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="space-y-8">
      <CategoriasForm onCreate={crearCategoria} />

      <CategoriasList
        categorias={categorias}
        onUpdate={editarCategoria}
      />
    </div>
  );
}