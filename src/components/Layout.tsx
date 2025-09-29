import { NavLink, Outlet } from "react-router-dom";
import { BotMessageSquare } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { motion } from "framer-motion";

const Layout = () => {
  return (
    <div className="min-h-screen w-full flex flex-col">
      <header className="bg-card/80 border-b backdrop-blur-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <NavLink to="/" className="flex items-center gap-2 font-semibold text-lg">
            <BotMessageSquare className="h-6 w-6 text-primary" />
            <span>Real Estate AI Agents</span>
          </NavLink>
          <div className="flex items-center gap-2">
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
            <ThemeToggle />
          </div>
        </div>
      </header>
      <main className="flex-1 container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Outlet />
        </motion.div>
      </main>
    </div>
  );
};

export default Layout;