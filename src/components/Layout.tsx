import { NavLink, Outlet } from "react-router-dom";
import { BotMessageSquare } from "lucide-react";

const Layout = () => {
  return (
    <div className="min-h-screen w-full flex flex-col">
      <header className="bg-background border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <NavLink to="/" className="flex items-center gap-2 font-semibold">
            <BotMessageSquare className="h-6 w-6" />
            <span>Real Estate AI Agents</span>
          </NavLink>
          <nav className="flex items-center gap-4">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `text-sm font-medium ${isActive ? "text-primary" : "text-muted-foreground"} transition-colors hover:text-primary`
              }
            >
              Dashboard
            </NavLink>
          </nav>
        </div>
      </header>
      <main className="flex-1 container mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;