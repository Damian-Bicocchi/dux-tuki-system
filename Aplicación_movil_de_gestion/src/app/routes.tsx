import { createBrowserRouter } from "react-router";
import RootLayout from "./layouts/RootLayout";
import LoginPage from "./pages/LoginPage";
import AyudaPage from "./pages/AyudaPage";
import HomePage from "./pages/HomePage";
import NuevoAlquilerPage from "./pages/NuevoAlquilerPage";
import AlquileresPage from "./pages/AlquileresPage";
import StockPage from "./pages/StockPage";
import ClientesPage from "./pages/ClientesPage";
import ClienteDetallePage from "./pages/ClienteDetallePage";
import NuevoClientePage from "./pages/NuevoClientePage";
import StockDetallePage from "./pages/StockDetallePage";
import EstadisticasPage from "./pages/EstadisticasPage";
import CalendarioPage from "./pages/CalendarioPage";
import NuevoUsuarioPage from "./pages/NuevoUsuarioPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: LoginPage,
  },
  {
    path: "/ayuda",
    Component: AyudaPage,
  },
  {
    path: "/app",
    Component: RootLayout,
    children: [
      { index: true, Component: HomePage },
      { path: "nuevo-alquiler", Component: NuevoAlquilerPage },
      { path: "alquileres", Component: AlquileresPage },
      { path: "calendario", Component: CalendarioPage },
      { path: "stock", Component: StockPage },
      { path: "stock/:id", Component: StockDetallePage },
      { path: "clientes", Component: ClientesPage },
      { path: "clientes/nuevo", Component: NuevoClientePage },
      { path: "clientes/:id", Component: ClienteDetallePage },
      { path: "estadisticas", Component: EstadisticasPage },
      { path: "sistema", Component: NuevoUsuarioPage },
    ],
  },
]);