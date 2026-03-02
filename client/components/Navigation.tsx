import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Anchor, Search, Calendar, User, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { logout } from "@/store/slices/authSlice";
import SignInModal from "@/components/SignInModal";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showSignInModal, setShowSignInModal] = useState(false);
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  const handleSignOut = () => {
    dispatch(logout());
    localStorage.removeItem("authToken");
  };

  const getUserInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { href: "/discover", label: "Discover Ports", icon: Search },
    ...(isAuthenticated && user
      ? [{ href: "/reservations", label: "My Reservations", icon: Calendar }]
      : []),
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-navy-950/80 backdrop-blur-lg border-b border-white/10 py-2"
          : "bg-transparent py-4"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="w-20 h-10 rounded-xl flex items-center justify-center overflow-hidden"
            >
              <img
                src="https://garbrix.com/navios/assets/images/logo.png"
                alt="Dock Now"
              />
            </motion.div>
          </Link>

          {/* Desktop Navigation - empty center */}
          <div className="hidden md:flex items-center justify-center space-x-2" />

          {/* Right Side Actions */}
          <div className="hidden md:flex items-center space-x-3">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={`relative flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive(item.href)
                    ? "text-white"
                    : "text-navy-100 hover:text-white hover:bg-white/5"
                }`}
              >
                {isActive(item.href) && (
                  <motion.div
                    layoutId="nav-pill"
                    className="absolute inset-0 bg-white/10 rounded-xl"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            ))}
            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center space-x-2 text-navy-100 hover:text-white hover:bg-white/5 rounded-xl px-3"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-gradient-ocean text-white text-sm font-semibold">
                        {getUserInitials(user.full_name)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-56 bg-navy-950/95 backdrop-blur-xl border-white/10 text-white"
                >
                  <div className="px-2 py-1.5 text-sm">
                    <p className="font-medium">{user.full_name}</p>
                    <p className="text-xs text-navy-200">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link
                      to="/reservations"
                      className="flex items-center text-navy-100 hover:text-white hover:bg-white/5"
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      My Reservations
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link
                      to="/profile"
                      className="flex items-center text-navy-100 hover:text-white hover:bg-white/5"
                    >
                      <User className="w-4 h-4 mr-2" />
                      Profile Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="cursor-pointer text-red-400 hover:text-red-300 hover:bg-white/5"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                onClick={() => setShowSignInModal(true)}
                className="bg-gradient-ocean hover:shadow-glow text-white border-none rounded-xl px-6 transition-all duration-300 hover:scale-105 active:scale-95"
              >
                Sign In
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-white hover:bg-white/5 rounded-xl"
            >
              {isOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="md:hidden mt-2 rounded-2xl overflow-hidden border border-white/10 bg-navy-950/95 backdrop-blur-xl shadow-2xl"
            >
              <div className="px-2 pt-2 pb-3 space-y-1">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 ${
                      isActive(item.href)
                        ? "bg-white/10 text-white"
                        : "text-navy-100 hover:text-white hover:bg-white/5"
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Link>
                ))}

                <div className="flex flex-col space-y-2 pt-4 mt-2 border-t border-white/5">
                  {isAuthenticated && user ? (
                    <>
                      <div className="px-4 py-2 border-b border-white/5">
                        <p className="text-sm font-semibold text-white">
                          {user.full_name}
                        </p>
                        <p className="text-xs text-navy-200">{user.email}</p>
                      </div>
                      <Button
                        variant="ghost"
                        onClick={handleSignOut}
                        className="justify-start text-red-400 hover:text-red-300 hover:bg-white/5 rounded-xl"
                      >
                        <LogOut className="w-4 h-4 mr-3" />
                        Sign Out
                      </Button>
                    </>
                  ) : (
                    <Button
                      onClick={() => {
                        setShowSignInModal(true);
                        setIsOpen(false);
                      }}
                      className="bg-gradient-ocean text-white border-none rounded-xl py-6 mt-2"
                    >
                      Sign In
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Sign In Modal */}
      <SignInModal
        isOpen={showSignInModal}
        onClose={() => setShowSignInModal(false)}
        onSuccess={() => setShowSignInModal(false)}
      />
    </nav>
  );
};

export default Navigation;
