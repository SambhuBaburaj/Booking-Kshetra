"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Users, Search } from "lucide-react";
import { useRoomAvailability } from "../hooks/useRoomAvailability";

export default function BookingWidget() {
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState({ adults: 2, children: 0 });

  const { totalAvailable, isLoading, error } = useRoomAvailability({
    checkIn: checkIn || undefined,
    checkOut: checkOut || undefined,
    capacity: guests.adults + guests.children,
  });

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split("T")[0];

  // Get tomorrow's date for checkout minimum
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split("T")[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const searchParams = new URLSearchParams({
      checkIn: checkIn || today,
      checkOut: checkOut || tomorrowStr,
      adults: guests.adults.toString(),
      children: guests.children.toString(),
    });

    window.location.href = `/booking?${searchParams.toString()}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-white/98 backdrop-blur-md rounded-2xl p-6 md:p-8 shadow-2xl max-w-4xl mx-auto border border-white/20"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid md:grid-cols-4 gap-4">
          {/* Check-in */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-800 mb-1">
              Check-In
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="date"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                min={today}
                placeholder="Select check-in date"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-gray-900 font-medium [&::-webkit-calendar-picker-indicator]:opacity-100 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
              />
            </div>
          </div>

          {/* Check-out */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-800 mb-1">
              Check-Out
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="date"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                min={checkIn || tomorrowStr}
                placeholder="Select check-out date"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-gray-900 font-medium [&::-webkit-calendar-picker-indicator]:opacity-100 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
              />
            </div>
          </div>

          {/* Guests */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-800 mb-1">
              Guests
            </label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={`${guests.adults}-${guests.children}`}
                onChange={(e) => {
                  const [adults, children] = e.target.value
                    .split("-")
                    .map(Number);
                  setGuests({ adults, children });
                }}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white appearance-none text-gray-900 font-medium cursor-pointer"
              >
                <option value="1-0">1 Adult</option>
                <option value="2-0">2 Adults</option>
                <option value="2-1">2 Adults, 1 Child</option>
                <option value="2-2">2 Adults, 2 Children</option>
                <option value="3-0">3 Adults</option>
                <option value="3-1">3 Adults, 1 Child</option>
                <option value="4-0">4 Adults</option>
                <option value="4-1">4 Adults, 1 Child</option>
                <option value="4-2">4 Adults, 2 Children</option>
              </select>
            </div>
          </div>

          {/* Search Button */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-transparent">
              Search
            </label>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white py-0.5 px-6 rounded-lg transition-all duration-300 font-semibold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-1 hover:scale-105 active:transform active:scale-100"
            >
              <Search className="w-5 h-5" />
              <span className="hidden sm:inline">Check Availability</span>
              <span className="sm:hidden">Search</span>
            </button>
          </div>
        </div>

        {/* Quick stats */}
        <div className="flex justify-center gap-8 pt-4 border-t border-gray-200">
          <div className="text-center">
            {isLoading ? (
              <div className="text-2xl font-bold text-gray-400 animate-pulse">
                ...
              </div>
            ) : error ? (
              <div className="text-2xl font-bold text-red-500">!</div>
            ) : totalAvailable === 0 ? (
              <div className="text-2xl font-bold text-red-600">0</div>
            ) : (
              <div className="text-2xl font-bold text-primary-600">
                {totalAvailable}
              </div>
            )}
            <div className="text-sm text-gray-600">
              {totalAvailable === 0 && !isLoading && !error
                ? "No Rooms Available"
                : "Rooms Available"}
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gold-500">4.9</div>
            <div className="text-sm text-gray-600">Guest Rating</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">30+</div>
            <div className="text-sm text-gray-600">Activities</div>
          </div>
        </div>
      </form>
    </motion.div>
  );
}
