// App.jsx — root application with routing

import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import { useEffect } from "react";
import AuthLayout from "../layouts/AuthLayout";
import AppLayout from "../layouts/AppLayout";
import Onboarding from "../pages/onboarding/Onboarding";
import Login from "../pages/auth/Login";
import Signup from "../pages/auth/Signup";
import PersonaLibrary from "../pages/library/PersonaLibrary";
import ChatPage from "../pages/chat/ChatPage";
import Premium from "../pages/premium/Premium";
import Settings from "../pages/settings/Settings";
import NotFound from "../pages/NotFound";
import Home from "../pages/home/Home";
import { ToastProvider } from "../components/ui/Toast";
import { useThemeStore } from "../store/useThemeStore";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/onboarding",
    element: <Onboarding />,
  },
  {
    element: <AuthLayout />,
    children: [
      { path: "login", element: <Login /> },
      { path: "signup", element: <Signup /> },
    ],
  },
  {
    path: "app",
    element: <AppLayout />,
    children: [
      { index: true, element: <Navigate to="library" replace /> },
      { path: "library", element: <PersonaLibrary /> },
      { path: "chat/:id", element: <ChatPage /> },
      { path: "chat", element: <ChatPage /> },
      { path: "premium", element: <Premium /> },
      { path: "settings", element: <Settings /> },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);

function ThemeInitializer() {
  const initTheme = useThemeStore((s) => s.initTheme);
  useEffect(() => {
    initTheme();
  }, [initTheme]);
  return null;
}

export default function App() {
  return (
    <ToastProvider>
      <ThemeInitializer />
      <RouterProvider router={router} />
    </ToastProvider>
  );
}
