"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

export default function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const isHomePage = pathname === "/";
  const isMahinasPage = pathname === "/marinas";

  useEffect(() => {
    const handleScroll = () => {
      // On home page, become solid after hero section (around 600px)
      // On other pages, become solid immediately after small scroll
      const threshold = isHomePage ? 600 : 20;
      setScrolled(window.scrollY > threshold);
    };

    handleScroll(); // Check initial state
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHomePage]);

  const navItems = [
    { name: "Home", href: "/" },
    { name: "Marinas", href: "/marinas" },
    { name: "About", href: "/about" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled || !isHomePage
          ? "backdrop-blur-xl bg-gray-900/95 shadow-2xl border-b border-gray-700/50"
          : "bg-transparent border-b border-transparent"
      }`}
      style={{
        WebkitBackdropFilter: scrolled || !isHomePage ? "blur(20px)" : "none",
        backdropFilter:
          scrolled || !isHomePage ? "blur(20px) saturate(180%)" : "none",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-ocean-400 to-ocean-600 rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
              <img
                src="https://garbrix.com/navios/assets/images/logo.png"
                alt="DockNow"
                className="h-10 sm:h-12 relative z-10 transition-transform group-hover:scale-110 duration-300"
              />
            </div>
          </Link>

          {/* CTA Button - Hide on marinas page */}
          {!isMahinasPage && (
            <div className="hidden md:block">
              <Link
                href="/marinas"
                className="group relative inline-flex items-center gap-2 px-6 py-2.5 rounded-full font-semibold text-white overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105"
              >
                {/* Animated gradient background */}
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-500 bg-[length:200%_100%] animate-gradient"></div>

                {/* Glass top highlight */}
                <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-white/10 to-transparent"></div>

                {/* Glow effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full blur-lg opacity-30 group-hover:opacity-60 transition-opacity duration-300"></div>

                <span className="relative z-10 flex items-center gap-2">
                  Book Now
                  <svg
                    className="w-4 h-4 transition-transform group-hover:translate-x-1 duration-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </span>
              </Link>
            </div>
          )}

          {/* Mobile menu button */}
          <button
            className={`md:hidden relative p-2 rounded-xl backdrop-blur-sm border transition-colors ${
              isHomePage && !scrolled
                ? "bg-white/20 border-white/30 text-white hover:bg-white/30"
                : "bg-gray-700/50 border-gray-600/50 text-white hover:bg-gray-600/50"
            }`}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Subtle bottom border glow */}
      <div
        className={`absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent to-transparent transition-opacity duration-500 ${
          isHomePage && !scrolled
            ? "via-white/0 opacity-0"
            : "via-gray-700/50 opacity-100"
        }`}
      ></div>
    </header>
  );
}
