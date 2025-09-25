"use client";

import Link from "next/link";
import {
  Crown,
  Phone,
  Mail,
  MapPin,
  Shield,
  Facebook,
  Instagram,
  Twitter,
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-slate-900 via-gray-900 to-slate-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <Link href="/" className="flex items-center gap-3 mb-6">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-lg shadow-lg">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                  KSHETRA
                </h1>
                <p className="text-xs text-gray-300 font-light tracking-wider">
                  RETREAT RESORT
                </p>
              </div>
            </Link>
            <p className="text-gray-300 text-sm leading-relaxed">
              Experience tranquility and adventure at Kerala's premier
              beachfront resort. Discover yoga, wellness, and exciting water
              sports in paradise.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-orange-400">
              Quick Links
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/"
                  className="text-gray-300 hover:text-orange-400 transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/yoga"
                  className="text-gray-300 hover:text-orange-400 transition-colors"
                >
                  Yoga Programs
                </Link>
              </li>
              <li>
                <Link
                  href="/services"
                  className="text-gray-300 hover:text-orange-400 transition-colors"
                >
                  Adventure Sports
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-gray-300 hover:text-orange-400 transition-colors"
                >
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-orange-400">
              Contact Info
            </h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-orange-400 flex-shrink-0" />
                <span className="text-gray-300 text-sm">
                  88 Varkala Beach, Kerala, India
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-orange-400 flex-shrink-0" />
                <a
                  href="tel:+919847012345"
                  className="text-gray-300 hover:text-orange-400 transition-colors text-sm"
                >
                  +91 98470 12345
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-orange-400 flex-shrink-0" />
                <a
                  href="mailto:info@kshetraretreat.com"
                  className="text-gray-300 hover:text-orange-400 transition-colors text-sm"
                >
                  info@kshetraretreat.com
                </a>
              </li>
            </ul>
          </div>

          {/* Admin & Social */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-orange-400">
              Connect
            </h3>

            {/* Social Media */}
            <div>
              <h4 className="text-sm font-medium mb-3 text-gray-300">
                Follow Us
              </h4>
              <div className="flex gap-3">
                <a
                  href="#"
                  className="p-2 bg-white/10 rounded-lg hover:bg-orange-500/20 transition-colors"
                >
                  <Facebook className="w-4 h-4 text-gray-300 hover:text-orange-400" />
                </a>
                <a
                  href="#"
                  className="p-2 bg-white/10 rounded-lg hover:bg-orange-500/20 transition-colors"
                >
                  <Instagram className="w-4 h-4 text-gray-300 hover:text-orange-400" />
                </a>
                <a
                  href="#"
                  className="p-2 bg-white/10 rounded-lg hover:bg-orange-500/20 transition-colors"
                >
                  <Twitter className="w-4 h-4 text-gray-300 hover:text-orange-400" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2024 Kshetra Retreat Resort. All rights reserved.
          </p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <Link
              href="/privacy"
              className="text-gray-400 hover:text-orange-400 text-sm transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-gray-400 hover:text-orange-400 text-sm transition-colors"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
