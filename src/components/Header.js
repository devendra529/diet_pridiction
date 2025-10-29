"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Home, Activity, Search, MessageCircle, User } from "lucide-react";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { name: "Home", path: "/", icon: Home },
    { name: "Dashboard", path: "/dashboard", icon: Activity },
    { name: "Diet Prediction", path: "/diet-prediction", icon: User },
    { name: "Find Calories", path: "/find-calories", icon: Search },
    { name: "Chat Bot", path: "/chatbot", icon: MessageCircle },
  ];

  const isActive = (path) => pathname === path;

  return (
    <header className="header-nav">
      <div className="header-container">
        <div className="header-logo">
          <span className="logo-icon">🥗</span>
          <span className="logo-text">NutriTrack AI</span>
        </div>

        {/* Desktop Navigation */}
        <nav className="desktop-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`nav-link ${isActive(item.path) ? "active" : ""}`}
              >
                <Icon size={18} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="mobile-menu-button"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <nav className="mobile-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`mobile-nav-link ${isActive(item.path) ? "active" : ""}`}
                onClick={() => setIsMenuOpen(false)}
              >
                <Icon size={20} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      )}

      <style jsx>{`
        .header-nav {
          background: linear-gradient(135deg, #788decff 0%, #9a6fc4ff 100%);
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          position: sticky;
          top: 0;
          z-index: 1000;
        }

        .header-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 1rem 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .header-logo {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 1.5rem;
          font-weight: 700;
          color: white;
        }

        .logo-icon {
          font-size: 2rem;
        }

        .desktop-nav {
          display: flex;
          gap: 0.5rem;
        }

        .nav-link {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.25rem;
          color: rgba(255, 255, 255, 0.9);
          text-decoration: none;
          border-radius: 8px;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .nav-link:hover {
          background: rgba(255, 255, 255, 0.15);
          color: white;
        }

        .nav-link.active {
          background: rgba(255, 255, 255, 0.25);
          color: white;
        }

        .mobile-menu-button {
          display: none;
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          padding: 0.5rem;
        }

        .mobile-nav {
          display: none;
        }

        @media (max-width: 768px) {
          .desktop-nav {
            display: none;
          }

          .mobile-menu-button {
            display: block;
          }

          .mobile-nav {
            display: flex;
            flex-direction: column;
            padding: 1rem;
            gap: 0.5rem;
            background: rgba(0, 0, 0, 0.1);
          }

          .mobile-nav-link {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 1rem;
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 500;
            transition: all 0.3s ease;
          }

          .mobile-nav-link:hover,
          .mobile-nav-link.active {
            background: rgba(222, 57, 57, 0.2);
          }

          .header-container {
            padding: 1rem;
          }

          .logo-text {
            font-size: 1.25rem;
          }
        }
      `}</style>
    </header>
  );
}