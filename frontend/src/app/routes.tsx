import { createBrowserRouter } from 'react-router';

import RootLayout from './layouts/RootLayout';
import ErrorPage from './pages/ErrorPage';

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
import AdministracionPage from "./pages/AdministracionPage";

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
    errorElement: <ErrorPage />,
    children: [
      { index: true, Component: HomePage },
      { path: "nuevo-alquiler", Component: NuevoAlquilerPage },
      { path: "alquileres", Component: AlquileresPage },
      { path: "alquileres/:id", Component: AlquilerDetallePage },
      { path: "calendario", Component: CalendarioPage },
      { path: "stock", Component: StockPage },
      { path: "stock/nuevo", Component: NuevoStockPage },
      { path: "stock/:id", Component: StockDetallePage },
      { path: "clientes", Component: ClientesPage },
      { path: "clientes/nuevo", Component: NuevoClientePage },
      { path: "clientes/:id", Component: ClienteDetallePage },
      { path: "estadisticas", Component: EstadisticasPage },
      { path: "sistema", Component: AdministracionPage },
    ],
  },
]);
