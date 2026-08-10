import { RouterProvider } from 'react-router';
import { router } from './routes';
import { AuthProvider } from './context/AuthContext'; // <-- Ajusta la ruta a tu AuthContext

export default function App() {
  return (
  <AuthProvider>
   <RouterProvider router={router} />

  </AuthProvider>
);
}

