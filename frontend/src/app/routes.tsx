import { createBrowserRouter } from 'react-router';

import RootLayout from './layouts/RootLayout';
import ErrorPage from './pages/ErrorPage';
import { RequirePermission } from './components/RequirePermission';

import LoginPage from "./pages/LoginPage";
import AyudaPage from "./pages/AyudaPage";
import HomePage from "./pages/HomePage";
import NuevoAlquilerPage from "./pages/NuevoAlquilerPage";
import AlquileresPage from "./pages/AlquileresPage";
import AlquilerDetallePage from "./pages/AlquilerDetallePage";
import NuevoStockPage from "./pages/NuevoStockPage";
import StockPage from "./pages/StockPage";
import ClientesPage from "./pages/ClientesPage";
import ClienteDetallePage from "./pages/ClienteDetallePage";
import NuevoClientePage from "./pages/NuevoClientePage";
import StockDetallePage from "./pages/StockDetallePage";
import EstadisticasPage from "./pages/EstadisticasPage";
import CalendarioPage from "./pages/CalendarioPage";
import ConfiguracionesAvanzadasPage from "./pages/ConfiguracionesAvanzadasPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: LoginPage,
    errorElement: <ErrorPage />,
  },
  {
    path: "/ayuda",
    Component: AyudaPage,
    errorElement: <ErrorPage />,
  },
  {
    path: "/app",
    Component: RootLayout,
    errorElement: <ErrorPage/>,
    children: [
      { index: true, Component: HomePage },

      // Alquileres
      {
        path: "nuevo-alquiler",
        element: (
          <RequirePermission permission="permiso_para_registrar_alquileres">
            <NuevoAlquilerPage />
          </RequirePermission>
        ),
      },
      {
        path: "alquileres",
        element: (
          <RequirePermission permission="permiso_para_ver_alquileres">
            <AlquileresPage />
          </RequirePermission>
        ),
      },
      {
        path: "alquileres/:id",
        element: (
          <RequirePermission permission="permiso_para_ver_alquileres">
            <AlquilerDetallePage />
          </RequirePermission>
        ),
      },
      {
        path: "calendario",
        element: (
          <RequirePermission permission="permiso_para_ver_alquileres">
            <CalendarioPage />
          </RequirePermission>
        ),
      },

      // Stock
      {
        path: "stock",
        element: (
          <RequirePermission permission="permiso_para_listar_stock">
            <StockPage />
          </RequirePermission>
        ),
      },
      {
        path: "stock/nuevo",
        element: (
          <RequirePermission permission="permiso_para_crear_stock">
            <NuevoStockPage />
          </RequirePermission>
        ),
      },
      {
        path: "stock/:id",
        element: (
          <RequirePermission permission="permiso_para_listar_stock">
            <StockDetallePage />
          </RequirePermission>
        ),
      },

      // Clientes
      {
        path: "clientes",
        element: (
          <RequirePermission permission="permiso_para_listar_clientes">
            <ClientesPage />
          </RequirePermission>
        ),
      },
      {
        path: "clientes/nuevo",
        element: (
          <RequirePermission permission="permiso_para_registrar_clientes">
            <NuevoClientePage />
          </RequirePermission>
        ),
      },
      {
        path: "clientes/:id",
        element: (
          <RequirePermission permission="permiso_para_listar_clientes">
            <ClienteDetallePage />
          </RequirePermission>
        ),
      },

      // Estadísticas y sistema
      {
        path: "estadisticas",
        element: (
          <RequirePermission permission="permiso_para_ver_estadisticas">
            <EstadisticasPage />
          </RequirePermission>
        ),
      },
      {
        path: "sistema",
        element: (
          <RequirePermission permission="permiso_para_entrar_a_configuraciones_avanzadas">
            <ConfiguracionesAvanzadasPage />
          </RequirePermission>
        ),
      },
    ],
  },
]);
