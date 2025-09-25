"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, Crown, Phone, Mail, Shield } from "lucide-react";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigation = [
    { name: "Home", href: "/" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <header className="bg-gradient-to-r from-slate-900 via-gray-900 to-slate-900 shadow-lg sticky top-0 z-50 backdrop-blur-sm bg-opacity-95">
      {/* Top bar */}
      <div className="bg-gray-900 text-white py-2">
        <div className="container mx-auto px-4 flex justify-between items-center text-sm">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              <span>info@kshetraretreat.com</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              <span>+91 98470 12345</span>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <span>88 Varkala Beach, Kerala</span>
            <Link
              href="/admin/login"
              className="flex items-center gap-1 text-blue-300 hover:text-blue-100 transition-colors"
            >
              <Shield className="w-4 h-4" />
              <span>Admin</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-lg shadow-lg">
              <Crown className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">KSHETRA</h1>
              <p className="text-sm text-gray-300 font-light tracking-wider">
                RETREAT RESORT
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8 absolute left-1/2 transform -translate-x-1/2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-gray-200 hover:text-blue-400 font-medium transition-colors duration-200 relative group"
              >
                {item.name}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-400 group-hover:w-full transition-all duration-300"></span>
              </Link>
            ))}
          </nav>

          {/* Spacer for balance */}
          <div className="hidden md:block w-32"></div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-gray-200 hover:text-white"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-gray-800 border-t border-gray-700">
          <nav className="container mx-auto px-4 py-4">
            <div className="flex flex-col gap-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-gray-200 hover:text-blue-400 font-medium py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}

              <Link
                href="/admin/login"
                className="flex items-center gap-2 text-blue-600 hover:text-blue-800 py-2 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                <Shield className="w-4 h-4" />
                Admin Access
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
