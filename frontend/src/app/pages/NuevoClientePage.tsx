import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, UserPlus, Mail, IdCard, Phone, User, AlertCircle } from 'lucide-react';
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input';
import es from "react-phone-number-input/locale/es";
import 'react-phone-number-input/style.css';
import { SuccessModal } from '../components/SuccessModal';
import { getAuthHeaders } from '../../../../backend/utils/putHeaders';

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
    
    /* Nuevos estados para manejar errores de servidor y carga */
    const [apiError, setApiError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

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

        if (!formData.telefono) {
            errs.telefono = 'El teléfono es obligatorio';
        } else if (!isValidPhoneNumber(formData.telefono)) {
            errs.telefono = 'Ingresá un número de teléfono válido';
        }

        return errs;
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSubmitted(true);
        setApiError(null); // Limpiamos errores previos del servidor

        const errs = validate();
        if (Object.keys(errs).length > 0) {
            setErrors(errs);
            return;
        }

        setIsSubmitting(true);

        const payload = {
            nombre: formData.nombre.trim(),
            email: formData.email.trim().toLowerCase(),
            dni: formData.dni.trim(),
            telefono: formData.telefono,
        };

        try {
            const response = await fetch('http://127.0.0.1:3001/api/clientes', {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                setClienteNombre(formData.nombre.trim());
                setShowSuccess(true);
            } else {
                // Captura el mensaje retornado por la API o usa uno genérico
                const errorData = await response.json().catch(() => ({}));
                setApiError(
                    errorData.error || errorData.message || 'Ocurrió un error al registrar el cliente.'
                );
            }
        } catch (error) {
            // Error de conexión / servidor caído
            setApiError('No se pudo conectar con el servidor. Intentalo de nuevo más tarde.');
        } finally {
            setIsSubmitting(false);
        }
    }

    function handleChange(field: keyof typeof formData, value: string) {
        setFormData((prev) => ({ ...prev, [field]: value }));
        
        // Al escribir limpiamos la alerta general
        if (apiError) setApiError(null);
        
        if (submitted) {
            setErrors((prev) => ({ ...prev, [field]: undefined }));
        }
    }

    return (
        <div className="px-5 py-2 pb-10 max-w-lg mx-auto">
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
                <div
                    className="w-12 h-12 rounded-2xl bg-[#218a72]/10 flex items-center justify-center flex-shrink-0"
                    aria-hidden="true"
                >
                    <UserPlus size={24} className="text-[#218a72]" />
                </div>
                <div>
                    <h1 className="font-extrabold text-gray-900 text-xl">
                        Registrar nuevo cliente
                    </h1>
                    <p className="text-sm text-gray-500">
                        Completá los datos para registrarlo
                    </p>
                </div>
            </div>

            <SuccessModal
                isOpen={showSuccess}
                title="¡Cliente registrado!"
                message={`${clienteNombre} fue agregado correctamente al sistema.`}
                onClose={() => navigate('/app/clientes', { replace: true })}
            />

            <form
                onSubmit={handleSubmit}
                className="space-y-5"
                noValidate
                aria-label="Formulario de registro de cliente"
            >
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
                        className={inputClass(!!errors.nombre)}
                    />
                    {errors.nombre && (
                        <p className="text-xs text-red-600 mt-1.5 font-semibold">
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
                        onChange={(e) =>
                            handleChange(
                                'dni',
                                e.target.value.replace(/\D/g, '')
                            )
                        }
                        placeholder="Ej: 35123456"
                        maxLength={8}
                        className={inputClass(!!errors.dni)}
                    />
                    {errors.dni && (
                        <p className="text-xs text-red-600 mt-1.5 font-semibold">
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
                        className={inputClass(!!errors.email)}
                    />
                    {errors.email && (
                        <p className="text-xs text-red-600 mt-1.5 font-semibold">
                            {errors.email}
                        </p>
                    )}
                </FormField>

                {/* Teléfono */}
                <FormField
                    id="telefono"
                    label="Teléfono"
                    icon={Phone}
                    required
                    error={errors.telefono}
                >
                    <PhoneInput
                        id="telefono"
                        defaultCountry="AR"
                        labels={es}
                        withCountryCallingCode
                        international
                        countryCallingCodeEditable={false}
                        value={formData.telefono}
                        limitMaxLength={true}
                        onChange={(value) =>
                            handleChange('telefono', value || '')
                        }
                        placeholder="Ej: 1145237890"
                        className={errors.telefono ? 'has-error' : ''}
                    />
                    {errors.telefono && (
                        <p
                            id="error-telefono"
                            className="text-xs text-red-600 mt-1.5 font-semibold"
                            role="alert"
                        >
                            {errors.telefono}
                        </p>
                    )}
                </FormField>

                {/* Cartel de Error del Servidor / Red */}
                {apiError && (
                    <div
                        className="p-3.5 bg-red-50 border-2 border-red-200 rounded-xl flex items-center gap-2.5 text-red-700 text-sm font-medium animate-fade-in"
                        role="alert"
                    >
                        <AlertCircle size={18} className="text-red-500 shrink-0" aria-hidden="true" />
                        <span>{apiError}</span>
                    </div>
                )}

                {/* Acciones */}
                <div className="flex flex-col gap-3 pt-2">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-2.5 bg-[#218a72] hover:bg-[#1b6f5c] disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] text-white rounded-xl font-bold transition-all focus:outline-none focus:ring-4 focus:ring-[#218a72]/30 text-sm"
                    >
                        {isSubmitting ? 'Registrando...' : 'Registrar cliente'}
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/app/clientes')}
                        className="w-full py-2.5 border-2 border-gray-300 bg-white text-gray-700 rounded-xl font-bold hover:bg-gray-100 hover:border-gray-400 active:scale-[0.98] transition-all focus:outline-none focus:ring-4 focus:ring-gray-300 text-sm"
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
            <label
                htmlFor={id}
                className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2"
            >
                <Icon size={16} className="text-[#218a72]" aria-hidden="true" />
                {label}
                {required && (
                    <span className="text-red-600 font-bold">(obligatorio)</span>
                )}
                {optional && (
                    <span className="text-gray-400 font-normal text-xs">
                        (opcional)
                    </span>
                )}
            </label>
            {children}
        </div>
    );
}