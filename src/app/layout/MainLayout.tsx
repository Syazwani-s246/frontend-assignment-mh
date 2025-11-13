import { Header } from "./Header";
import { Outlet } from "react-router-dom";

export default function MainLayout() {
  return (
    <div className="min-h-dvh flex flex-col">
      <Header />
      <main className="container py-6 flex-1">
        <Outlet />
      </main>
    </div>
  );
}
