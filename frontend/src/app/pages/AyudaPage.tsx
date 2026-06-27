import { useNavigate } from "react-router";
import {
  ArrowLeft,
  Film,
  Package,
  Users,
  Calendar,
  BarChart3,
  CheckCircle,
  AlertTriangle,
  Clock,
  List,
  MonitorCog
} from "lucide-react";

const ACCENT = "#218a72";
const ACCENT_DARK = "#1b6f5c";
const ACCENT_LIGHT = "#E1F5EE";

interface FeatureCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
}

function FeatureCard({
  icon: Icon,
  title,
  description,
}: FeatureCardProps) {
  return (
    <div className="bg-white rounded-2xl p-5 border-2 border-gray-100 flex gap-4 items-start">
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: ACCENT_LIGHT }}
        aria-hidden="true"
      >
        <Icon
          size={22}
          style={{ color: ACCENT }}
          strokeWidth={2}
        />
      </div>
      <div>
        <h3 className="font-bold text-gray-900 text-base mb-1">
          {title}
        </h3>
        <p className="text-sm text-gray-600 leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}

interface StepProps {
  number: number;
  title: string;
  description: string;
}

function Step({ number, title, description }: StepProps) {
  return (
    <li className="flex gap-4 items-start">
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm text-white mt-0.5"
        style={{ background: ACCENT }}
        aria-hidden="true"
      >
        {number}
      </div>
      <div>
        <p className="font-bold text-gray-900 text-sm">
          {title}
        </p>
        <p className="text-sm text-gray-600 leading-relaxed mt-0.5">
          {description}
        </p>
      </div>
    </li>
  );
}

export default function AyudaPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Skip link */}
      <a
        href="#contenido-principal"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:bg-white focus:text-gray-900 focus:px-4 focus:py-2 focus:rounded-lg focus:shadow-lg focus:font-semibold"
      >
        Saltar al contenido principal
      </a>

      {/* Header */}
      <header
        className="sticky top-0 z-40 shadow-sm"
        style={{
          background: `linear-gradient(135deg, #29a285, ${ACCENT}, ${ACCENT_DARK})`,
        }}
      >
        <div className="max-w-3xl mx-auto px-5 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-white"
            aria-label="Volver al inicio de sesión"
          >
            <ArrowLeft
              size={22}
              className="text-white"
              aria-hidden="true"
            />
          </button>
          <div>
            <p className="text-white/70 text-xs font-semibold uppercase tracking-wider">
              TUKI SYSTEM
            </p>
            <h1 className="text-white text-lg font-bold leading-tight">
              Ayuda y documentación
            </h1>
          </div>
        </div>
      </header>

      {/* Contenido */}
      <main
        id="contenido-principal"
        className="max-w-3xl mx-auto px-5 py-8 space-y-10"
      >
        {/* Hero de la sección */}
        <section aria-labelledby="intro-titulo">
          <div
            className="rounded-3xl p-7 md:p-10 text-white text-center"
            style={{
              background: `linear-gradient(135deg, #29a285, ${ACCENT_DARK})`,
            }}
          >
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
              style={{ background: "rgba(255,255,255,0.15)" }}
              aria-hidden="true"
            >
              <Film
                size={34}
                className="text-white"
                strokeWidth={1.8}
              />
            </div>
            <h2
              id="intro-titulo"
              className="text-2xl md:text-3xl font-extrabold mb-3 tracking-tight"
            >
              ¿Qué es Tuki System?
            </h2>
            <p className="text-white/85 text-base md:text-lg leading-relaxed max-w-lg mx-auto">
              Tuki es un sistema de gestión de alquileres de
              equipos cinematográficos. Permite controlar el
              stock, los clientes y el estado de cada alquiler
              desde un solo lugar.
            </p>
          </div>
        </section>

        {/* Funcionalidades */}
        <section aria-labelledby="funcionalidades-titulo">
          <div className="mb-4">
            <p
              className="text-xs font-bold uppercase tracking-wider mb-1"
              style={{ color: ACCENT }}
            >
              Sistema
            </p>
            <h2
              id="funcionalidades-titulo"
              className="text-xl font-bold text-gray-900"
            >
              ¿Qué podés hacer?
            </h2>
          </div>

          <div
            className="grid grid-cols-1 md:grid-cols-2 gap-3"
            role="list"
          >
            {[
              {
                icon: Package,
                title: "Gestión de stock",
                description:
                  "Registrá cada equipo disponible, su estado y cuándo está ocupado.",
              },
              {
                icon: List,
                title: "Alquileres",
                description:
                  "Creá y seguí cada alquiler: cliente, equipo, fechas y estado de devolución.",
              },
              {
                icon: Calendar,
                title: "Alquileres del dia",
                description:
                  "Visualizá los alquileres en la fecha, cuales inician o vencen en el dia de hoy.",
              },
              {
                icon: Users,
                title: "Clientes",
                description:
                  "Administrá tu base de clientes con historial de alquileres.",
              },
              {
                icon: BarChart3,
                title: "Estadísticas",
                description:
                  "Analizá ingresos, equipo más alquilado y rentabilidad del negocio.",
              },
              {
                icon: AlertTriangle,
                title: "Alertas de vencimiento",
                description:
                  "El sistema te avisa automáticamente cuando hay alquileres vencidos sin devolver.",
              },
              {
                icon: MonitorCog,
                title: "Opciones de administrador",
                description: "Permite al administrador crear nuevos usuarios para el sistema"
              }
            ].map((f) => (
              <div key={f.title} role="listitem">
                <FeatureCard {...f} />
              </div>
            ))}
          </div>
        </section>

        {/* Estados de alquiler */}
        {/* <section aria-labelledby="estados-titulo">
          <div className="mb-4">
            <p
              className="text-xs font-bold uppercase tracking-wider mb-1"
              style={{ color: ACCENT }}
            >
              Referencia
            </p>
            <h2
              id="estados-titulo"
              className="text-xl font-bold text-gray-900"
            >
              Estados de un alquiler
            </h2>
          </div>

          <div className="bg-white rounded-2xl border-2 border-gray-100 overflow-hidden">
            <ul
              role="list"
              aria-label="Estados posibles de un alquiler"
            >
              {[
                {
                  color: "#1D9E75",
                  bg: "#E1F5EE",
                  border: "#5DCAA5",
                  icon: Clock,
                  label: "En fecha",
                  desc: "El alquiler está activo y dentro del plazo acordado.",
                },
                {
                  color: "#BA7517",
                  bg: "#FAEEDA",
                  border: "#EF9F27",
                  icon: AlertTriangle,
                  label: "Vence hoy",
                  desc: "El equipo debe devolverse antes del final del día.",
                },
                {
                  color: "#E24B4A",
                  bg: "#FCEBEB",
                  border: "#F09595",
                  icon: AlertTriangle,
                  label: "Vencido",
                  desc: "El plazo pasó y el equipo todavía no fue devuelto.",
                },
                {
                  color: "#639922",
                  bg: "#EAF3DE",
                  border: "#97C459",
                  icon: CheckCircle,
                  label: "Entregado en término",
                  desc: "El equipo fue devuelto antes o en la fecha acordada.",
                },
                {
                  color: "#7F77DD",
                  bg: "#EEEDFE",
                  border: "#AFA9EC",
                  icon: CheckCircle,
                  label: "Entregado fuera de término",
                  desc: "El equipo fue devuelto pero después de la fecha límite.",
                },
              ].map((estado, i, arr) => {
                const Icon = estado.icon;
                return (
                  <li
                    key={estado.label}
                    className={`flex items-start gap-4 px-5 py-4 ${
                      i < arr.length - 1
                        ? "border-b border-gray-100"
                        : ""
                    }`}
                    aria-label={`${estado.label}: ${estado.desc}`}
                  >
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{
                        background: estado.bg,
                        border: `1.5px solid ${estado.border}`,
                      }}
                      aria-hidden="true"
                    >
                      <Icon
                        size={17}
                        style={{ color: estado.color }}
                        strokeWidth={2}
                      />
                    </div>
                    <div>
                      <p
                        className="text-sm font-bold leading-tight"
                        style={{ color: estado.color }}
                      >
                        {estado.label}
                      </p>
                      <p className="text-sm text-gray-600 mt-0.5 leading-relaxed">
                        {estado.desc}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </section> */}

        {/* Flujo de uso */}
        <section aria-labelledby="flujo-titulo">
          <div className="mb-4">
            <p
              className="text-xs font-bold uppercase tracking-wider mb-1"
              style={{ color: ACCENT }}
            >
              Primeros pasos
            </p>
            <h2
              id="flujo-titulo"
              className="text-xl font-bold text-gray-900"
            >
              ¿Cómo empezar?
            </h2>
          </div>

          <div className="bg-white rounded-2xl border-2 border-gray-100 p-6">
            <ol
              className="space-y-5"
              role="list"
              aria-label="Pasos para empezar a usar el sistema"
            >
              <Step
                number={1}
                title="Cargá tu stock"
                description="Ingresá cada equipo que tenés disponible para alquilar: nombre, descripción y estado."
              />
              <Step
                number={2}
                title="Registrá tus clientes"
                description="Agregá los datos de tus clientes habituales para agilizar la creación de alquileres."
              />
              <Step
                number={3}
                title="Creá un alquiler"
                description='Desde "Nuevo Alquiler", asociá un equipo y un cliente, definí las fechas y confirmá.'
              />
              <Step
                number={4}
                title="Seguí el estado desde el panel"
                description="El home te muestra en tiempo real cuántos alquileres están activos, vencidos e ingresos del mes."
              />
              <Step
                number={5}
                title="Registrá las devoluciones"
                description="Cuando un equipo regresa, actualizá el estado del alquiler para mantener el stock al día."
              />
            </ol>
          </div>
        </section>

        {/* CTA volver */}
        <div className="pb-8">
          <button
            onClick={() => navigate("/")}
            className="w-full py-4 rounded-2xl font-bold text-base text-white transition-all hover:opacity-90 active:scale-[0.99] focus:outline-none focus:ring-4"
            style={{
              background: `linear-gradient(135deg, #29a285, ${ACCENT_DARK})`,
              focusRingColor: ACCENT,
            }}
            aria-label="Ir a iniciar sesión"
          >
            Ir a iniciar sesión
          </button>
        </div>
      </main>
    </div>
  );
}