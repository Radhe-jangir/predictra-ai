import { AnimatePresence, motion } from "framer-motion";
import { Bell, Database, Home, LineChart, LogOut, MessageSquare, Search, Settings, User } from "lucide-react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { cn } from "../lib/utils";
import { fadeUpSm, stagger, pageTransition } from "../lib/motion";

const items = [
  { to: "/app", label: "Dashboard", icon: Home },
  { to: "/app/datasets", label: "Datasets", icon: Database },
  { to: "/app/insights", label: "Insights", icon: LineChart },
  { to: "/app/chat", label: "Chat", icon: MessageSquare },
  { to: "/app/profile", label: "Profile", icon: User },
  { to: "/app/settings", label: "Settings", icon: Settings },
];

export function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-muted/35">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-border bg-background/95 backdrop-blur p-4 lg:block">
        <button className="mb-7 flex items-center gap-3" onClick={() => navigate("/app")}>
          <motion.span
            className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground font-black"
            animate={{ rotate: [0, -3, 3, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            P
          </motion.span>
          <span className="text-lg font-semibold">Predictra AI</span>
        </button>
        <motion.nav
          className="space-y-1"
          variants={stagger}
          initial="hidden"
          animate="show"
        >
          {items.map((item) => (
            <motion.div key={item.to} variants={fadeUpSm}>
              <NavLink
                to={item.to}
                end={item.to === "/app"}
                className={({ isActive }) =>
                  cn(
                    "relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-all hover:bg-muted hover:text-foreground",
                    isActive && "bg-primary/10 text-primary font-medium",
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <motion.div
                        layoutId="sidebar-active"
                        className="absolute inset-0 rounded-lg bg-primary/10"
                        transition={{ type: "spring", stiffness: 350, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10 flex items-center gap-3">
                      <item.icon size={18} />
                      {item.label}
                    </span>
                  </>
                )}
              </NavLink>
            </motion.div>
          ))}
        </motion.nav>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        <header className="glass sticky top-0 z-20 border-b border-border">
          <div className="flex h-16 items-center gap-3 px-4 md:px-6">
            <div className="relative max-w-md flex-1">
              <Search className="pointer-events-none absolute left-3 top-2.5 text-muted-foreground" size={18} />
              <Input className="pl-10" placeholder="Search datasets, columns, insights..." />
            </div>
            <ThemeToggle />
            <Button variant="secondary" size="icon" aria-label="Notifications">
              <Bell size={18} />
            </Button>
            <div className="hidden min-w-0 items-center gap-3 md:flex">
              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 text-center text-sm font-semibold leading-9 text-primary">
                {user?.name.charAt(0)}
              </div>
              <span className="truncate text-sm font-medium">{user?.name}</span>
            </div>
            <Button variant="ghost" size="icon" onClick={logout} aria-label="Log out">
              <LogOut size={18} />
            </Button>
          </div>
        </header>
        <main className="mx-auto max-w-7xl p-4 md:p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              variants={pageTransition}
              initial="hidden"
              animate="show"
              exit="exit"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
