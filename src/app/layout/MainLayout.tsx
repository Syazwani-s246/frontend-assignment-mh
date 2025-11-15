import { Header } from "./Header";
import { Outlet } from "react-router-dom";

export default function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 flex-1 max-w-4xl">
        <Outlet />
      </main>
    </div>
  );
}
