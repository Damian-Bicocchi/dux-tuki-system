import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Save, X } from 'lucide-react';

export default function NuevoAlquilerPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    cliente: '',
    equipo: '',
    fechaInicio: '',
    fechaFin: '',
    precio: '',
    deposito: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí iría la lógica para guardar
    alert('Alquiler creado exitosamente');
    navigate('/app/alquileres');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="px-5 py-6 max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Cliente */}
        <div>
          <label htmlFor="cliente" className="block text-sm font-bold text-gray-700 mb-2">
            Cliente *
          </label>
          <input
            type="text"
            id="cliente"
            name="cliente"
            value={formData.cliente}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#218a72]/20 focus:border-[#218a72] transition-colors"
            placeholder="Nombre del cliente"
            aria-required="true"
          />
        </div>

        {/* Equipo */}
        <div>
          <label htmlFor="equipo" className="block text-sm font-bold text-gray-700 mb-2">
            Equipo a alquilar *
          </label>
          <select
            id="equipo"
            name="equipo"
            value={formData.equipo}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#218a72]/20 focus:border-[#218a72] transition-colors"
            aria-required="true"
          >
            <option value="">Seleccionar equipo</option>
            <option value="camara-sony-a7">Cámara Sony A7 III</option>
            <option value="camara-canon-5d">Cámara Canon 5D Mark IV</option>
            <option value="microfono-rode">Micrófono Rode NTG3</option>
            <option value="tripode-manfrotto">Trípode Manfrotto</option>
            <option value="luces-led">Kit de luces LED</option>
          </select>
        </div>

        {/* Fechas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="fechaInicio" className="block text-sm font-bold text-gray-700 mb-2">
              Fecha inicio *
            </label>
            <input
              type="date"
              id="fechaInicio"
              name="fechaInicio"
              value={formData.fechaInicio}
              onChange={handleChange}
              required
              max={formData.fechaFin}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#218a72]/20 focus:border-[#218a72] transition-colors"
              aria-required="true"
            />
          </div>
          <div>
            <label htmlFor="fechaFin" className="block text-sm font-bold text-gray-700 mb-2">
              Fecha fin *
            </label>
            <input
              type="date"
              id="fechaFin"
              name="fechaFin"
              value={formData.fechaFin}
              onChange={handleChange}
              required
              min={formData.fechaInicio}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#218a72]/20 focus:border-[#218a72] transition-colors"
              aria-required="true"
            />
          </div>
        </div>

        {/* Precios */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="precio" className="block text-sm font-bold text-gray-700 mb-2">
              Precio de alquiler *
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">$</span>
              <input
                type="number"
                id="precio"
                name="precio"
                value={formData.precio}
                onChange={handleChange}
                required
                min="0"
                className="w-full pl-8 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#218a72]/20 focus:border-[#218a72] transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                placeholder="0"
                aria-required="true"
              />
            </div>
          </div>
          <div>
            <label htmlFor="deposito" className="block text-sm font-bold text-gray-700 mb-2">
              Depósito de garantía
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">$</span>
              <input
                type="number"
                id="deposito"
                name="deposito"
                value={formData.deposito}
                onChange={handleChange}
                min="0"
                className="w-full pl-8 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#218a72]/20 focus:border-[#218a72] transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                placeholder="0"
              />
            </div>
          </div>
        </div>

        {/* Botones */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            className="flex-1 bg-[#218a72] text-white py-4 px-6 rounded-xl font-bold hover:bg-[#1b6f5c] focus:bg-[#1b6f5c] transition-colors focus:outline-none focus:ring-4 focus:ring-[#218a72]/30 flex items-center justify-center gap-2"
          >
            <Save size={20} />
            Guardar alquiler
          </button>
          <button
            type="button"
            onClick={() => navigate('/app/')}
            className="px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 focus:bg-gray-50 transition-colors focus:outline-none focus:ring-4 focus:ring-gray-300"
            aria-label="Cancelar y volver al inicio"
          >
            <X size={20} />
          </button>
        </div>
      </form>
    </div>
  );
}
