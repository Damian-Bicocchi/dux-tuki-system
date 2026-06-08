import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface UsuarioFormData {
  email: string;
  password: string;
  confirmPassword: string;
  rol: string;
}

interface UsuarioFormProps {
  initialValues?: UsuarioFormData;
  onSubmit: (data: UsuarioFormData) => void;
  submitLabel?: string;
}

export function UsuarioForm({
  initialValues,
  onSubmit,
  submitLabel = 'Guardar',
}: UsuarioFormProps) {
  const [formData, setFormData] = useState<UsuarioFormData>(
    initialValues ?? {
      email: '',
      password: '',
      confirmPassword: '',
      rol: 'Administrador',
    }
  );

  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));

    if (error) {
      setError('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Validaciones locales básicas
    if (!formData.email || !formData.password || !formData.confirmPassword) {
      setError('Por favor, completá todos los campos obligatorios.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError(
        'Las contraseñas no coinciden. Verificá los datos ingresados.'
      );
      return;
    }

    // 2. Si todo está bien, limpiamos errores
    setError('');
    
    // 3. Ejecutamos la acción de guardar (comunicación con el backend/padre)
    onSubmit(formData);

    // 4. Mostramos el alert de éxito
    alert('¡Usuario creado con éxito!');
  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="space-y-6"
      aria-label="Formulario de usuario"
    >
      {error && (
        <div
          id="form-error"
          role="alert"
          aria-live="assertive"
          className="p-4 rounded-xl border border-red-200 bg-red-50 text-red-700"
        >
          {error}
        </div>
      )}

      <div>
        <label
          htmlFor="email"
          className="block font-medium mb-2"
        >
          Correo electrónico
          <span
            aria-hidden="true"
            className="text-red-600 ml-1"
          >
            *
          </span>
        </label>

        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          aria-required="true"
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={
            error ? 'form-error' : undefined
          }
          autoComplete="email"
          className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-4 focus:ring-[#218a72]/20 focus:border-[#218a72]"
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="block font-medium mb-2"
        >
          Contraseña
          <span
            aria-hidden="true"
            className="text-red-600 ml-1"
          >
            *
          </span>
        </label>

        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            aria-required="true"
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={
              error ? 'form-error' : undefined
            }
            autoComplete="new-password"
            className="w-full border border-gray-300 rounded-xl px-4 py-3 pr-12 focus:outline-none focus:ring-4 focus:ring-[#218a72]/20 focus:border-[#218a72]"
          />

          <button
            type="button"
            onClick={() =>
              setShowPassword(prev => !prev)
            }
            aria-label={
              showPassword
                ? 'Ocultar contraseña'
                : 'Mostrar contraseña'
            }
            aria-pressed={showPassword}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#218a72]"
          >
            {showPassword ? (
              <EyeOff size={18} aria-hidden="true" />
            ) : (
              <Eye size={18} aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      <div>
        <label
          htmlFor="confirmPassword"
          className="block font-medium mb-2"
        >
          Repetí la contraseña
          <span
            aria-hidden="true"
            className="text-red-600 ml-1"
          >
            *
          </span>
        </label>

        <div className="relative">
          <input
            type={
              showConfirmPassword
                ? 'text'
                : 'password'
            }
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            aria-required="true"
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={
              error ? 'form-error' : undefined
            }
            autoComplete="new-password"
            className="w-full border border-gray-300 rounded-xl px-4 py-3 pr-12 focus:outline-none focus:ring-4 focus:ring-[#218a72]/20 focus:border-[#218a72]"
          />

          <button
            type="button"
            onClick={() =>
              setShowConfirmPassword(prev => !prev)
            }
            aria-label={
              showConfirmPassword
                ? 'Ocultar confirmación de contraseña'
                : 'Mostrar confirmación de contraseña'
            }
            aria-pressed={showConfirmPassword}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#218a72]"
          >
            {showConfirmPassword ? (
              <EyeOff size={18} aria-hidden="true" />
            ) : (
              <Eye size={18} aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      <div>
        <label
          htmlFor="rol"
          className="block font-medium mb-2"
        >
          Rol
        </label>

        <select
          id="rol"
          name="rol"
          value={formData.rol}
          onChange={handleChange}
          aria-required="true"
          className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-4 focus:ring-[#218a72]/20 focus:border-[#218a72]"
        >
          <option value="Administrador">
            Administrador
          </option>
        </select>
      </div>

      <button
        type="submit"
        className="bg-[#218a72] text-white px-5 py-3 rounded-xl font-semibold hover:bg-[#1b6f5c] focus:outline-none focus:ring-4 focus:ring-[#218a72]/30 transition-colors"
      >
        {submitLabel}
      </button>
    </form>
  );
}