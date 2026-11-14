import { createBrowserRouter, Navigate } from "react-router";
import { ProtectedRoute } from "./ProtectedRoute";
import { AppLayout } from "@/widgets/app-layout/AppLayout";
import { LoginPage } from "@/pages/login/ui/LoginPage";
import { RegisterPage } from "@/pages/register/ui/RegisterPage";
import { EmployeesPage } from "@/pages/employees/ui/EmployeesPage";

export const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/employees" replace /> },
  { path: "/login", element: <LoginPage /> },
  { path: "/register", element: <RegisterPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: "/employees", element: <EmployeesPage /> },
        ],
      },
    ],
  },
  { path: "*", element: <Navigate to="/employees" replace /> },
]);
