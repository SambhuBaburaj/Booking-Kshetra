'use client'

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Car,
  Users,
  Calendar,
  LogOut,
  Menu,
  X,
  Building2,
  Home
} from 'lucide-react';

const AgencyNav = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [agency, setAgency] = useState<any>(null);

  useEffect(() => {
    const agencyData = localStorage.getItem('agency');
    if (agencyData) {
      setAgency(JSON.parse(agencyData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('agencyToken');
    localStorage.removeItem('agency');
    router.push('/agency/login');
  };

  const navItems = [
    { href: '/agency/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/agency/bookings', icon: Calendar, label: 'Transport Bookings' },
    { href: '/agency/vehicles', icon: Car, label: 'Vehicles' },
    { href: '/agency/drivers', icon: Users, label: 'Drivers' },
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 bg-white rounded-lg shadow-lg"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transform transition-transform duration-200 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>

        {/* Logo */}
        <div className="p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Car className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Agency Portal</h2>
              <p className="text-sm text-gray-600">Transport Management</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4">
          <div className="space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <button
                  key={item.href}
                  onClick={() => {
                    router.push(item.href);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    isActive
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Agency Info & Logout */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-white">
          {agency && (
            <div className="mb-3">
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="w-4 h-4 text-gray-500" />
                <p className="text-sm font-medium text-gray-900">{agency.name}</p>
              </div>
              <p className="text-xs text-gray-600">{agency.email}</p>
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={() => router.push('/')}
              className="flex-1 px-3 py-2 text-sm text-gray-700 hover:text-gray-900 flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4" />
              Site
            </button>

            <button
              onClick={handleLogout}
              className="flex-1 px-3 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default AgencyNav;