import { createBrowserRouter } from 'react-router';

import RootLayout from './layouts/RootLayout';

import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import NuevoAlquilerPage from './pages/NuevoAlquilerPage';
import AlquileresPage from './pages/AlquileresPage';
import StockPage from './pages/StockPage';
import ClientesPage from './pages/ClientesPage';
import EstadisticasPage from './pages/EstadisticasPage';
import CalendarioPage from './pages/CalendarioPage';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: LoginPage,
  },

  {
    path: '/app',
    Component: RootLayout,
    children: [
      { index: true, Component: HomePage },
      { path: 'nuevo-alquiler', Component: NuevoAlquilerPage },
      { path: 'alquileres', Component: AlquileresPage },
      { path: 'calendario', Component: CalendarioPage },
      { path: 'stock', Component: StockPage },
      { path: 'clientes', Component: ClientesPage },
      { path: 'estadisticas', Component: EstadisticasPage },
    ],
  },
]);