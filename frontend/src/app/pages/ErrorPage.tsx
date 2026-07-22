import { useRouteError, isRouteErrorResponse } from 'react-router';

export default function ErrorPage() {
  const error = useRouteError();

  let title = 'Ocurrió un error';
  let message =
    'No pudimos completar la operación solicitada.';
  if (isRouteErrorResponse(error)) {
    title = `${error.status}`;
    message = error.statusText;
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-md text-center">
        <h1 className="text-4xl font-bold text-[#218a72] mb-4">
          {title}
        </h1>

        <p className="text-gray-600 mb-6">
          {message}
        </p>

        <button
          onClick={() => window.location.href = '/'}
          className="bg-[#218a72] text-white px-6 py-3 rounded-xl font-semibold"
        >
          Volver al inicio de sesión
        </button>
      </div>
    </div>
  );
}