import { useEffect, useRef, useState } from 'react';
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input';
import es from 'react-phone-number-input/locale/es';
import 'react-phone-number-input/style.css';
import { AlertCircle, IdCard, Loader2, Mail, Phone, User, X } from 'lucide-react';
import {
  updateCliente,
  type Cliente,
} from '../data/clientesData';
import { useUnsavedChangesWarning } from '../hooks/useUnsavedChangesWarning';

interface ClienteEditModalProps {
  cliente: Cliente;
  isOpen: boolean;
  onClose: () => void;
  onSaved: (cliente: Cliente) => void;
}

interface FormState {
  nombre: string;
  email: string;
  dni: string;
  telefono: string;
}

type FormErrors = Partial<Record<keyof FormState, string>>;

function validar(form: FormState): FormErrors {
  const errors: FormErrors = {};

  if (!form.nombre.trim()) {
    errors.nombre = 'El nombre es obligatorio';
  }

  if (!form.email.trim()) {
    errors.email = 'El correo es obligatorio';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Ingresá un correo válido';
  }

  if (!form.dni.trim()) {
    errors.dni = 'El DNI es obligatorio';
  } else if (form.dni.length < 7) {
    errors.dni = 'El DNI debe tener al menos 7 dígitos';
  }

  if (!form.telefono) {
    errors.telefono = 'El teléfono es obligatorio';
  } else if (!isValidPhoneNumber(form.telefono)) {
    errors.telefono = 'Ingresá un número de teléfono válido';
  }

  return errors;
}

export function ClienteEditModal({
  cliente,
  isOpen,
  onClose,
  onSaved,
}: ClienteEditModalProps) {
  const [form, setForm] = useState<FormState>({
    nombre: cliente.nombre || '',
    email: cliente.email || '',
    dni: cliente.dni || '',
    telefono: cliente.telefono || '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const dialogRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  const isDirty =
    form.nombre !== (cliente.nombre || '') ||
    form.email !== (cliente.email || '') ||
    form.dni !== (cliente.dni || '') ||
    form.telefono !== (cliente.telefono || '');
  useUnsavedChangesWarning(isDirty);

  useEffect(() => {
    if (!isOpen) return;

    previouslyFocusedRef.current = document.activeElement as HTMLElement;
    const timer = window.setTimeout(() => nameRef.current?.focus(), 50);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== 'Tab' || !dialogRef.current) return;

      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((element) => !element.hasAttribute('disabled'));

      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      window.clearTimeout(timer);
      document.removeEventListener('keydown', handleKeyDown);
      previouslyFocusedRef.current?.focus?.();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (field: keyof FormState, value: string) => {
    setForm((previous) => ({ ...previous, [field]: value }));
    setServerError(null);

    if (submitted) {
      setErrors((previous) => ({ ...previous, [field]: undefined }));
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitted(true);
    setServerError(null);

    const validationErrors = validar(form);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setIsSaving(true);

      const actualizado = await updateCliente(cliente.id, {
        nombre: form.nombre.trim(),
        email: form.email.trim().toLowerCase(),
        dni: form.dni.trim(),
        telefono: form.telefono,
        notas: cliente.notas ?? null,
      });

      onSaved({
        ...cliente,
        ...actualizado,
        alquileres: cliente.alquileres,
      });
    } catch (error) {
      setServerError(
        error instanceof Error
          ? error.message
          : 'No se pudieron guardar los cambios.',
      );
    } finally {
      setIsSaving(false);
    }
  };

  const inputClass = (field: keyof FormState) =>
    `w-full px-4 py-3 border-2 rounded-xl transition-colors focus:outline-none focus:ring-4 ${
      errors[field]
        ? 'border-red-400 focus:border-red-400 focus:ring-red-100'
        : 'border-gray-300 focus:border-[#218a72] focus:ring-[#218a72]/20'
    }`;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="editar-cliente-title"
        className="relative bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <h2
            id="editar-cliente-title"
            className="text-xl font-bold text-gray-900"
          >
            Editar datos del cliente
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar edición de cliente"
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg focus:outline-none focus:ring-4 focus:ring-gray-300 transition-colors"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="p-6 space-y-5">
          <div>
            <label
              htmlFor="edit-cliente-nombre"
              className="flex items-center gap-2 text-sm font-bold text-gray-800 mb-2"
            >
              <User size={15} className="text-[#218a72]" aria-hidden="true" />
              Nombre completo
            </label>
            <input
              ref={nameRef}
              id="edit-cliente-nombre"
              type="text"
              maxLength={80}
              value={form.nombre}
              onChange={(event) => handleChange('nombre', event.target.value)}
              aria-invalid={Boolean(errors.nombre)}
              aria-describedby={errors.nombre ? 'error-nombre-cliente' : undefined}
              className={inputClass('nombre')}
            />
            {errors.nombre && (
              <p
                id="error-nombre-cliente"
                role="alert"
                className="text-xs text-red-600 mt-1.5 font-semibold"
              >
                {errors.nombre}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="edit-cliente-dni"
              className="flex items-center gap-2 text-sm font-bold text-gray-800 mb-2"
            >
              <IdCard size={15} className="text-[#218a72]" aria-hidden="true" />
              DNI
            </label>
            <input
              id="edit-cliente-dni"
              type="text"
              inputMode="numeric"
              maxLength={8}
              value={form.dni}
              onChange={(event) =>
                handleChange('dni', event.target.value.replace(/\D/g, ''))
              }
              aria-invalid={Boolean(errors.dni)}
              aria-describedby={errors.dni ? 'error-dni-cliente' : undefined}
              className={inputClass('dni')}
            />
            {errors.dni && (
              <p
                id="error-dni-cliente"
                role="alert"
                className="text-xs text-red-600 mt-1.5 font-semibold"
              >
                {errors.dni}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="edit-cliente-email"
              className="flex items-center gap-2 text-sm font-bold text-gray-800 mb-2"
            >
              <Mail size={15} className="text-[#218a72]" aria-hidden="true" />
              Correo electrónico
            </label>
            <input
              id="edit-cliente-email"
              type="email"
              inputMode="email"
              maxLength={254}
              value={form.email}
              onChange={(event) => handleChange('email', event.target.value)}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? 'error-email-cliente' : undefined}
              className={inputClass('email')}
            />
            {errors.email && (
              <p
                id="error-email-cliente"
                role="alert"
                className="text-xs text-red-600 mt-1.5 font-semibold"
              >
                {errors.email}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="edit-cliente-telefono"
              className="flex items-center gap-2 text-sm font-bold text-gray-800 mb-2"
            >
              <Phone size={15} className="text-[#218a72]" aria-hidden="true" />
              Teléfono
            </label>
            <PhoneInput
              id="edit-cliente-telefono"
              defaultCountry="AR"
              labels={es}
              withCountryCallingCode
              international
              countryCallingCodeEditable={false}
              value={form.telefono}
              limitMaxLength
              maxLength={16}
              onChange={(value) => handleChange('telefono', value || '')}
              className={errors.telefono ? 'has-error' : ''}
            />
            {errors.telefono && (
              <p
                id="error-telefono-cliente"
                role="alert"
                className="text-xs text-red-600 mt-1.5 font-semibold"
              >
                {errors.telefono}
              </p>
            )}
          </div>

          {serverError && (
            <div
              role="alert"
              className="flex items-center gap-2 p-3.5 bg-red-50 border-2 border-red-200 rounded-xl text-red-700 text-sm font-medium"
            >
              <AlertCircle size={18} className="text-red-500 shrink-0" aria-hidden="true" />
              <span>{serverError}</span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="flex-1 py-3 border-2 border-gray-300 bg-white text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-colors focus:outline-none focus:ring-4 focus:ring-gray-300 disabled:opacity-60"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 py-3 bg-[#218a72] hover:bg-[#1b6f5c] disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-xl font-bold transition-colors focus:outline-none focus:ring-4 focus:ring-[#218a72]/30 inline-flex items-center justify-center gap-2"
            >
              {isSaving && (
                <Loader2 size={18} className="animate-spin" aria-hidden="true" />
              )}
              {isSaving ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
