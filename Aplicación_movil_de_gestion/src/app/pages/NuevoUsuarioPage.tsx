import { useState } from 'react';
import { useNavigate } from 'react-router';
import { UserPlus, X, Eye, EyeOff } from 'lucide-react';

export default function NuevoUsuarioPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    role: 'administrador' // Valor por defecto
  });

  // Estados para manejar la visibilidad de las contraseñas
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validación: verificar que las contraseñas coincidan
    if (formData.password !== formData.confirmPassword) {
      alert('Las contraseñas no coinciden. Por favor, verificalas.');
      return;
    }

    // Aquí iría la lógica para registrar el usuario en el backend
    alert('Usuario creado exitosamente');
    navigate('/app/'); // O la ruta que manejes
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
        <h2>Registrar nuevo usuario</h2>
        {/* Correo Electrónico */}
        <div>
          <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-2">
            Correo electrónico *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#218a72]/20 focus:border-[#218a72] transition-colors"
            placeholder="ejemplo@correo.com"
            aria-required="true"
          />
        </div>

        {/* Contraseña */}
        <div>
          <label htmlFor="password" className="block text-sm font-bold text-gray-700 mb-2">
            Contraseña *
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6} // Opcional: longitud mínima de seguridad
              className="w-full pl-4 pr-12 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#218a72]/20 focus:border-[#218a72] transition-colors"
              placeholder="••••••••"
              aria-required="true"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        {/* Repetir Contraseña */}
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-bold text-gray-700 mb-2">
            Repetir contraseña *
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="w-full pl-4 pr-12 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#218a72]/20 focus:border-[#218a72] transition-colors"
              placeholder="••••••••"
              aria-required="true"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
              aria-label={showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        {/* Rol del Usuario */}
        <div>
          <label htmlFor="role" className="block text-sm font-bold text-gray-700 mb-2">
            Rol asignado *
          </label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#218a72]/20 focus:border-[#218a72] transition-colors"
            aria-required="true"
          >
            <option value="administrador">Administrador</option>
          </select>
        </div>

        {/* Botones de Acción */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            className="flex-1 bg-[#218a72] text-white py-4 px-6 rounded-xl font-bold hover:bg-[#1b6f5c] focus:bg-[#1b6f5c] transition-colors focus:outline-none focus:ring-4 focus:ring-[#218a72]/30 flex items-center justify-center gap-2"
          >
            <UserPlus size={20} />
            Confirmar usuario
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