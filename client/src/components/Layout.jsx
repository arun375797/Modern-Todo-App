import { useState, useEffect } from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import {
  LayoutDashboard,
  ListTodo,
  Settings,
  LogOut,
  Menu,
  X,
  Target,
  Calendar,
  Smartphone,
  Timer,
} from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";
import FocusMode from "./FocusMode";

const Layout = () => {
  const { user, logout } = useAuthStore();
  const { pathname } = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const navItems = [
    { label: "Today", path: "/app/today", icon: LayoutDashboard },
    { label: "Calendar", path: "/app/calendar", icon: Calendar },
    { label: "All Todos", path: "/app/all", icon: ListTodo },
    { label: "Focus Timer", path: "/app/focus-timer", icon: Timer },
    { label: "Settings", path: "/app/settings", icon: Settings },
    { label: "Install App", path: "/app/install", icon: Smartphone },
  ];

  const isActive = (path) => pathname === path;

  // Background style if user has image
  const getBgUrl = () => {
    const val = user?.preferences?.background?.value;
    if (!val) return "";
    return val.startsWith("http")
      ? val
      : `${import.meta.env.VITE_API_URL || ""}/${val}`;
  };

  const bgStyle = user?.preferences?.background?.value
    ? {
        backgroundImage: `url(${getBgUrl()})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }
    : {};

  const overlayStyle =
    user?.preferences?.background?.type === "upload"
      ? {
          backgroundColor: `rgba(0,0,0,${user.preferences.overlay?.dim || 0})`,
          backdropFilter: `blur(${user.preferences.overlay?.blur || 0}px)`,
        }
      : {};

  return (
    <div className="flex h-screen w-full relative bg-bg" style={bgStyle}>
      <FocusMode />
      {/* Background Overlay */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={overlayStyle}
      ></div>

      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex w-64 flex-col bg-card/90 backdrop-blur-sm border-r border-border z-10 glass-panel">
        <div className="p-6">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            MyTodo
          </h1>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive(item.path)
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted hover:bg-muted/10 hover:text-text"
              }`}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-border">
          <div className="flex items-center space-x-3 mb-4 px-4">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="text-sm">
              <p className="font-medium text-text">{user?.name}</p>
              <p className="text-xs text-muted truncate max-w-[120px]">
                {user?.email}
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center space-x-3 px-4 py-2 w-full text-red-500 hover:bg-red-500/10 rounded-lg transition-colors text-sm"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-card/90 backdrop-blur-md border-b border-border z-20 flex items-center justify-between px-4">
        <span className="text-xl font-bold text-primary">MyTodo</span>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-10 bg-card pt-20 px-4 md:hidden"
          >
            <nav className="space-y-4">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center space-x-4 p-4 rounded-xl text-lg ${
                    isActive(item.path)
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted"
                  }`}
                >
                  <item.icon size={24} />
                  <span>{item.label}</span>
                </Link>
              ))}
              <button
                onClick={logout}
                className="flex items-center space-x-4 p-4 w-full text-red-500 text-lg"
              >
                <LogOut size={24} />
                <span>Logout</span>
              </button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 overflow-auto relative z-0 pt-24 md:pt-0 p-6 md:p-8">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
