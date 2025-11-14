import { createBrowserRouter } from "react-router-dom";
import MainLayout from "./layout/MainLayout";
import UsersListPage from "@/features/users/pages/UsersListPage";
import UserFormPage from "@/features/users/pages/UserFormPage";
import UsersAnalyticsPage from "@/features/users/pages/UsersAnalyticsPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, element: <UsersListPage /> },
      { path: "users", element: <UsersListPage /> },
      { path: "users/new", element: <UserFormPage /> },
      { path: "users/:id", element: <UserFormPage /> },
      { path: "users/analytics", element: <UsersAnalyticsPage /> },
    ],
  },
]);
