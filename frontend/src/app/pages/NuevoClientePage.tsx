import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, UserPlus, Mail, IdCard, Phone, User } from 'lucide-react';
import { addCliente } from '../data/clientesData';
import { SuccessModal } from '../components/SuccessModal';

export default function NuevoClientePage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    dni: '',
    telefono: '',
  });
  const [errors, setErrors] = useState<Partial<typeof formData>>({});
  const [submitted, setSubmitted] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [clienteNombre, setClienteNombre] = useState('');

  function validate() {
    const errs: Partial<typeof formData> = {};
    if (!formData.nombre.trim()) errs.nombre = 'El nombre es obligatorio';
    if (!formData.email.trim()) {
      errs.email = 'El correo es obligatorio';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errs.email = 'Ingresá un correo válido';
    }
    if (!formData.dni.trim()) {
      errs.dni = 'El DNI es obligatorio';
    } else if (formData.dni.length < 7) {
      errs.dni = 'El DNI debe tener al menos 7 dígitos';
    }
    return errs;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    const payload = {
        nombre: formData.nombre.trim(),
        email: formData.email.trim().toLowerCase(),
        dni: formData.dni.trim(), // OJO: Tu backend actual ignora este campo
        ...(formData.telefono.trim() ? { telefono: formData.telefono.trim() } : {}),
    };
     fetch('http://127.0.0.1:3001/api/clientes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload), // ESTA ES LA MAGIA QUE FALTABA
    })
    .then(async (response) => {
      if (response.ok) {
        setClienteNombre(formData.nombre.trim());
        setShowSuccess(true);
      } else {
        // Extraemos el error del backend para mostrarlo
        const errorData = await response.json();
        console.error("Error del servidor:", errorData.error);
        // Aquí podrías hacer un setErrors({ general: errorData.error }) para mostrarlo en la UI
      }
    })
    .catch((error) => {
        console.error("Error de red:", error);
    });
  }

  function handleChange(field: keyof typeof formData, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (submitted) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  }

  return (
    <div className="px-5 py-6 pb-10 max-w-lg mx-auto">
      {/* Volver */}
      <button
        onClick={() => navigate('/app/clientes')}
        className="flex items-center gap-1.5 text-gray-500 hover:text-gray-800 mb-6 focus:outline-none focus:ring-2 focus:ring-[#218a72]/40 rounded-lg px-1 py-0.5 transition-colors"
        aria-label="Volver a clientes"
      >
        <ArrowLeft size={18} aria-hidden="true" />
        <span className="text-sm font-medium">Clientes</span>
      </button>

      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-[#218a72]/10 flex items-center justify-center flex-shrink-0" aria-hidden="true">
          <UserPlus size={24} className="text-[#218a72]" />
        </div>
        <div>
          <h1 className="font-extrabold text-gray-900 text-xl">Nuevo cliente</h1>
          <p className="text-sm text-gray-500">Completá los datos para registrarlo</p>
        </div>
      </div>

      <SuccessModal
        isOpen={showSuccess}
        title="¡Cliente registrado!"
        message={`${clienteNombre} fue agregado correctamente al sistema.`}
        onClose={() => navigate('/app/clientes', { replace: true })}
      />

      <form onSubmit={handleSubmit} className="space-y-5" noValidate aria-label="Formulario de registro de cliente">
        {/* Nombre */}
        <FormField
          id="nombre"
          label="Nombre completo"
          icon={User}
          required
          error={errors.nombre}
        >
          <input
            id="nombre"
            type="text"
            value={formData.nombre}
            onChange={(e) => handleChange('nombre', e.target.value)}
            placeholder="Ej: Juan Pérez"
            aria-required="true"
            aria-invalid={!!errors.nombre}
            aria-describedby={errors.nombre ? 'error-nombre' : undefined}
            className={inputClass(!!errors.nombre)}
          />
          {errors.nombre && (
            <p id="error-nombre" className="text-xs text-red-600 mt-1.5 font-semibold" role="alert">
              {errors.nombre}
            </p>
          )}
        </FormField>

        {/* DNI */}
        <FormField
          id="dni"
          label="DNI"
          icon={IdCard}
          required
          error={errors.dni}
        >
          <input
            id="dni"
            type="text"
            inputMode="numeric"
            value={formData.dni}
            onChange={(e) => handleChange('dni', e.target.value.replace(/\D/g, ''))}
            placeholder="Ej: 35123456"
            maxLength={8}
            aria-required="true"
            aria-invalid={!!errors.dni}
            aria-describedby={errors.dni ? 'error-dni' : undefined}
            className={inputClass(!!errors.dni)}
          />
          {errors.dni && (
            <p id="error-dni" className="text-xs text-red-600 mt-1.5 font-semibold" role="alert">
              {errors.dni}
            </p>
          )}
        </FormField>

        {/* Email */}
        <FormField
          id="email"
          label="Correo electrónico"
          icon={Mail}
          required
          error={errors.email}
        >
          <input
            id="email"
            type="email"
            inputMode="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="Ej: juan@email.com"
            aria-required="true"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'error-email' : undefined}
            className={inputClass(!!errors.email)}
          />
          {errors.email && (
            <p id="error-email" className="text-xs text-red-600 mt-1.5 font-semibold" role="alert">
              {errors.email}
            </p>
          )}
        </FormField>

        {/* Teléfono (opcional) */}
        <FormField id="telefono" label="Teléfono" icon={Phone} optional>
          <input
            id="telefono"
            type="tel"
            inputMode="tel"
            value={formData.telefono}
            onChange={(e) => handleChange('telefono', e.target.value)}
            placeholder="Ej: 11-4523-7890"
            className={inputClass(false)}
          />
        </FormField>

        {/* Acciones */}
        <div className="flex flex-col gap-3 pt-2">
          <button
            type="submit"
            className="w-full py-4 bg-[#218a72] hover:bg-[#1b6f5c] active:scale-[0.98] text-white rounded-xl font-bold transition-all focus:outline-none focus:ring-4 focus:ring-[#218a72]/30"
          >
            Registrar cliente
          </button>
          <button
            type="button"
            onClick={() => navigate('/app/clientes')}
            className="w-full py-4 border-2 border-gray-200 bg-white text-gray-700 rounded-xl font-bold hover:bg-gray-50 active:scale-[0.98] transition-all focus:outline-none focus:ring-4 focus:ring-gray-200"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}

function inputClass(hasError: boolean) {
  return `w-full px-4 py-3 border-2 rounded-xl transition-colors focus:outline-none focus:ring-4 ${
    hasError
      ? 'border-red-400 focus:border-red-400 focus:ring-red-200'
      : 'border-gray-300 focus:border-[#218a72] focus:ring-[#218a72]/20'
  }`;
}

function FormField({
  id,
  label,
  icon: Icon,
  required,
  optional,
  error,
  children,
}: {
  id: string;
  label: string;
  icon: React.ElementType;
  required?: boolean;
  optional?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
        <Icon size={16} className="text-[#218a72]" aria-hidden="true" />
        {label}
        {required && <span className="text-red-500" aria-hidden="true">*</span>}
        {optional && <span className="text-gray-400 font-normal text-xs">(opcional)</span>}
      </label>
      {children}
    </div>
  );
}
