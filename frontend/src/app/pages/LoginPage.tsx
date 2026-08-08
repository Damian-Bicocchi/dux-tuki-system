import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { HelpCircle, Eye, EyeOff } from 'lucide-react';
import { FailureModal } from '../components/FailureModal';

export default function LoginPage() {
    const navigate = useNavigate();
    
    const [showPassword, setShowPassword] = useState(false);
    const [errorModal, setErrorModal] = useState({
        isOpen: false,
        title: '',
        message: ''
    });

    async function handleLogin(e?: React.FormEvent) {
        if (e) e.preventDefault();

        const emailInput = document.getElementById('email') as HTMLInputElement;
        const passwordInput = document.getElementById('password') as HTMLInputElement;
        const email = emailInput?.value.trim();
        const password = passwordInput?.value.trim();

        if (!email || !password) {
            setErrorModal({
                isOpen: true,
                title: 'Campos incompletos',
                message: 'Por favor, completá ambos campos antes de continuar.'
            });
            return;
        }
        
        try {
            const response = await fetch(
                'http://localhost:3001/api/usuarios/login',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        username: email,
                        password: password,
                    }),
                },
            );

            if (!response.ok) {
                throw new Error('Las credenciales ingresadas son inválidas.');
            }

            const data = await response.json();

            // localStorage.setItem("token", data.token);
            navigate('/app/'); 
        } catch (error: any) {
            console.error("El fetch fallo porque: ", error);
            setErrorModal({
                isOpen: true,
                title: 'Error de inicio de sesión',
                message: error.message || 'Hubo un problema al conectar con el servidor.'
            });
        }
    }

    return (
        <main
            className="min-h-screen flex items-center justify-center bg-gray-100 p-4 sm:p-6"
            aria-labelledby="login-title"
        >
            <a
                href="#login-form"
                className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-white p-2 rounded shadow z-50"
            >
                Saltar al formulario de inicio de sesión
            </a>

            <section
                className="w-full max-w-md bg-white p-6 sm:p-8 rounded-2xl shadow-xl flex flex-col justify-center"
                aria-describedby="login-description"
            >
                <header className="mb-6 text-center">
                    <h1
                        id="login-title"
                        className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900"
                    >
                        Iniciar sesión
                    </h1>
                    <p
                        id="login-description"
                        className="text-gray-500 text-sm sm:text-base mt-2"
                    >
                        Ingresá tus credenciales para acceder al sistema.
                    </p>
                </header>

                <form
                    id="login-form"
                    onSubmit={handleLogin}
                    className="flex flex-col gap-4"
                    aria-label="Formulario de inicio de sesión"
                    noValidate
                >
                    {/* EMAIL */}
                    <div className="flex flex-col gap-1.5">
                        <label
                            htmlFor="email"
                            className="text-sm font-semibold text-gray-800"
                        >
                            Correo electrónico
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            inputMode="email"
                            aria-required="true"
                            aria-describedby="email-help"
                            placeholder="ejemplo@correo.com"
                            className="border border-gray-300 rounded-xl p-3 text-sm focus:outline-none focus:ring-4 focus:ring-[#218a72]/30 focus:border-[#218a72] transition-shadow"
                        />
                        <span
                            id="email-help"
                            className="text-xs text-gray-500"
                        >
                            Ingresá el correo asociado a tu cuenta.
                        </span>
                    </div>

                    {/* PASSWORD */}
                    <div className="flex flex-col gap-1.5">
                        <label
                            htmlFor="password"
                            className="text-sm font-semibold text-gray-800"
                        >
                            Contraseña
                        </label>
                        <div className="relative w-full">
                            <input
                                id="password"
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                autoComplete="current-password"
                                required
                                aria-required="true"
                                aria-describedby="password-help"
                                placeholder="Ingresá tu contraseña"
                                className="w-full border border-gray-300 rounded-xl p-3 pr-10 text-sm focus:outline-none focus:ring-4 focus:ring-[#218a72]/30 focus:border-[#218a72] transition-shadow"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                                aria-controls="password"
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#218a72] rounded-lg transition-colors"
                            >
                                {showPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
                            </button>
                        </div>
                        <span
                            id="password-help"
                            className="text-xs text-gray-500"
                        >
                            La contraseña distingue mayúsculas y minúsculas.
                        </span>
                    </div>

                    {/* BOTÓN */}
                    <button
                        type="submit"
                        aria-label="Ingresar al sistema"
                        className="bg-[#1b6f5c] hover:bg-[#155648] active:scale-[0.99] transition-all text-white font-bold text-base p-3 mt-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#1b6f5c]/40 shadow-lg shadow-[#1b6f5c]/20"
                    >
                        Ingresar
                    </button>
                </form>

                {/* Enlace a ayuda */}
                <div className="mt-6 pt-5 border-t border-gray-200 text-center">
                    <p className="text-gray-700 text-xs sm:text-sm font-medium mb-3">
                        ¿Primera vez en el sistema o tenés dudas?
                    </p>
                    <button
                        onClick={() => navigate('/ayuda')}
                        className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#1b6f5c] text-white font-semibold text-sm hover:bg-[#155648] transition-all focus:outline-none focus:ring-4 focus:ring-[#1b6f5c]/40 active:scale-[0.99] shadow-md shadow-[#1b6f5c]/20"
                        aria-label="Ver guía de ayuda y documentación del sistema"
                    >
                        <HelpCircle
                            size={18}
                            aria-hidden="true"
                            strokeWidth={2}
                        />
                        Ver guía de ayuda
                    </button>
                </div>
            </section>

            <FailureModal 
                isOpen={errorModal.isOpen}
                title={errorModal.title}
                message={errorModal.message}
                onClose={() => setErrorModal(prev => ({ ...prev, isOpen: false }))}
            />
        </main>
    );
}