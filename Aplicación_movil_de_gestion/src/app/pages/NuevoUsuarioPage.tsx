import { useState } from 'react';
import { useNavigate } from 'react-router';
import { UserPlus, X, Eye, EyeOff, AlertCircle } from 'lucide-react';

export default function NuevoUsuarioPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    role: 'administrador'
  });

  // Estados de visibilidad y manejo de errores accesible
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('Las contraseñas no coinciden. Por favor, verificalas.');
      return;
    }

    setErrorMessage('');
    alert('Usuario creado exitosamente'); // Aquí iría tu modal o toast accesible
    navigate('/app/');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Limpiamos el error si el usuario vuelve a escribir
    if (errorMessage) setErrorMessage('');
  };

  return (
    <div className="px-5 py-6 max-w-2xl mx-auto">
      {/* Título de la página debidamente jerarquizado */}
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Registrar nuevo usuario</h1>

      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        
        {/* Contenedor de Error Accesible (role="alert") */}
        {errorMessage && (
          <div 
            id="form-error-summary"
            role="alert" 
            className="flex items-center gap-3 p-4 bg-red-50 border-2 border-red-200 text-red-700 rounded-xl font-medium text-sm"
          >
            <AlertCircle size={20} aria-hidden="true" className="flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Correo Electrónico */}
        <div>
          <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-2">
            Correo electrónico <span className="text-red-600" aria-hidden="true">*</span>
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
            Contraseña <span className="text-red-600" aria-hidden="true">*</span>
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
              aria-required="true"
              aria-invalid={errorMessage ? "true" : "false"}
              aria-describedby={errorMessage ? "form-error-summary" : undefined}
              className="w-full pl-4 pr-12 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#218a72]/20 focus:border-[#218a72] transition-colors"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#218a72] rounded-lg p-0.5"
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              aria-pressed={showPassword}
            >
              {showPassword ? <EyeOff size={20} aria-hidden="true" /> : <Eye size={20} aria-hidden="true" />}
            </button>
          </div>
        </div>

        {/* Repetir Contraseña */}
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-bold text-gray-700 mb-2">
            Repetir contraseña <span className="text-red-600" aria-hidden="true">*</span>
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              aria-required="true"
              aria-invalid={errorMessage ? "true" : "false"}
              aria-describedby={errorMessage ? "form-error-summary" : undefined}
              className="w-full pl-4 pr-12 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#218a72]/20 focus:border-[#218a72] transition-colors"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#218a72] rounded-lg p-0.5"
              aria-label={showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              aria-pressed={showConfirmPassword}
            >
              {showConfirmPassword ? <EyeOff size={20} aria-hidden="true" /> : <Eye size={20} aria-hidden="true" />}
            </button>
          </div>
        </div>

        {/* Rol del Usuario */}
        <div>
          <label htmlFor="role" className="block text-sm font-bold text-gray-700 mb-2">
            Rol asignado <span className="text-red-600" aria-hidden="true">*</span>
          </label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            required
            aria-required="true"
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#218a72]/20 focus:border-[#218a72] transition-colors"
          >
            <option value="administrador">Administrador</option>
          </select>
        </div>

        {/* Botones de Acción */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            className="flex-1 bg-[#1b6f5c] text-white py-4 px-6 rounded-xl font-bold hover:bg-[#145345] focus:bg-[#145345] transition-colors focus:outline-none focus:ring-4 focus:ring-[#1b6f5c]/30 flex items-center justify-center gap-2"
            >
            <UserPlus size={20} aria-hidden="true" />
            Confirmar usuario
            </button>
          <button
            type="button"
            onClick={() => navigate('/app/')}
            className="px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 focus:bg-gray-50 transition-colors focus:outline-none focus:ring-4 focus:ring-gray-300 flex items-center justify-center"
            aria-label="Cancelar y volver al inicio"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>
      </form>
    </div>
  );
}