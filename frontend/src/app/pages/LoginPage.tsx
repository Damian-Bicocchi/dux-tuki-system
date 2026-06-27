import React from 'react';
import { useNavigate } from 'react-router';
import { HelpCircle } from 'lucide-react';

export default function LoginPage() {
    const navigate = useNavigate();

    async function handleLogin(e?: React.FormEvent) {
        if (e) e.preventDefault();

        const emailInput = document.getElementById('email') as HTMLInputElement;
        const passwordInput = document.getElementById(
            'password',
        ) as HTMLInputElement;
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        // Validación básica
        if (!email || !password) {
            alert('Por favor, completá ambos campos.');
            return;
        }
        try {
            console.log("Hola estoy tratando");
            const response = await fetch(
                'http://localhost:3001/api/usuarios/login',
                {
                    // Ajustalo a cómo armaste la ruta de login
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
            console.log("pase del await");

            if (!response.ok) {
                throw new Error('Credenciales inválidas');
            }

            const data = await response.json();
            console.log('Login exitoso', data);

            // Acá podrías guardar un token en localStorage
            // localStorage.setItem("token", data.token);

            navigate('/app/'); // o adonde sea luego de loguearte
        } catch (error) {
            console.error("El fetch fallo porque: ", error);
            alert(error.message);
        }
    }

    return (
        <main
            className="min-h-screen flex items-center justify-center bg-gray-100 p-4"
            aria-labelledby="login-title"
        >
            {/* Skip link */}
            <a
                href="#login-form"
                className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-white p-2 rounded shadow"
            >
                Saltar al formulario de inicio de sesión
            </a>

            <section
                className="w-full max-w-3xl min-h-[700px] bg-white p-16 md:p-24 rounded-3xl shadow-2xl flex flex-col justify-center"
                aria-describedby="login-description"
            >
                <header className="mb-12">
                    <h1
                        id="login-title"
                        className="text-5xl md:text-6xl font-extrabold text-center tracking-tight text-gray-900"
                    >
                        Iniciar sesión
                    </h1>
                    <p
                        id="login-description"
                        className="text-gray-500 text-center text-lg md:text-xl mt-4 max-w-xl mx-auto"
                    >
                        Ingresá tus credenciales para acceder al sistema.
                    </p>
                </header>

                <form
                    id="login-form"
                    onSubmit={handleLogin}
                    className="flex flex-col gap-8"
                    aria-label="Formulario de inicio de sesión"
                    noValidate
                >
                    {/* EMAIL */}
                    <div className="flex flex-col gap-3">
                        <label
                            htmlFor="email"
                            className="text-lg font-semibold text-gray-800"
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
                            className="border border-gray-300 rounded-xl p-4 text-lg focus:outline-none focus:ring-4 focus:ring-[#218a72]/30 focus:border-[#218a72] transition-shadow"
                        />
                        <span
                            id="email-help"
                            className="text-base text-gray-500"
                        >
                            Ingresá el correo asociado a tu cuenta.
                        </span>
                    </div>

                    {/* PASSWORD */}
                    <div className="flex flex-col gap-3">
                        <label
                            htmlFor="password"
                            className="text-lg font-semibold text-gray-800"
                        >
                            Contraseña
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            required
                            aria-required="true"
                            aria-describedby="password-help"
                            placeholder="Ingresá tu contraseña"
                            className="border border-gray-300 rounded-xl p-4 text-lg focus:outline-none focus:ring-4 focus:ring-[#218a72]/30 focus:border-[#218a72] transition-shadow"
                        />
                        <span
                            id="password-help"
                            className="text-base text-gray-500"
                        >
                            La contraseña distingue mayúsculas y minúsculas.
                        </span>
                    </div>

                    {/* BOTÓN */}
                    <button
                        type="submit"
                        aria-label="Ingresar al sistema"
                        className="bg-[#218a72] hover:bg-[#1b6f5c] active:scale-[0.99] transition-all text-white font-bold text-xl p-4 mt-4 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#218a72]/40 shadow-lg shadow-[#218a72]/20"
                        onClick={handleLogin}
                    >
                        Ingresar
                    </button>
                </form>

                {/* Enlace a ayuda */}
                <div className="mt-10 pt-8 border-t border-gray-100 text-center">
                    <p className="text-gray-500 text-base mb-3">
                        ¿Primera vez en el sistema o tenés dudas?
                    </p>
                    <button
                        onClick={() => navigate('/ayuda')}
                        className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border-2 border-[#218a72]/30 text-[#218a72] font-semibold text-base hover:bg-[#218a72]/5 hover:border-[#218a72] transition-all focus:outline-none focus:ring-4 focus:ring-[#218a72]/30 active:scale-[0.99]"
                        aria-label="Ver guía de ayuda y documentación del sistema"
                    >
                        <HelpCircle
                            size={20}
                            aria-hidden="true"
                            strokeWidth={2}
                        />
                        Ver guía de ayuda
                    </button>
                </div>
            </section>
        </main>
    );
}
