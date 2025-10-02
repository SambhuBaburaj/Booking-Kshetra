"use client";

import { useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  Users,
  Clock,
  Calendar,
  Star,
  Award,
  Heart,
  Sunrise,
  Sunset,
  MapPin,
  CheckCircle,
  User,
  Globe,
  DollarSign,
  BookOpen,
  Activity,
  ArrowRight,
} from "lucide-react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { useRouter } from "next/navigation";
import { yogaAPI } from "../../lib/api";

interface YogaSession {
  _id: string;
  type: "200hr" | "300hr";
  batchName: string;
  startDate: string;
  endDate: string;
  capacity: number;
  bookedSeats: number;
  price: number;
  instructor: {
    _id: string;
    name: string;
    bio: string;
    profileImage?: string;
  };
  schedule: {
    days: string[];
    time: string;
  };
  isActive: boolean;
  description?: string;
  prerequisites: string[];
  availableSeats?: number;
}

interface Teacher {
  _id: string;
  name: string;
  bio: string;
  specializations: string[];
  experience: number;
  certifications: string[];
  email: string;
  phone?: string;
  profileImage?: string;
  isActive: boolean;
  socialMedia?: {
    instagram?: string;
    facebook?: string;
    website?: string;
  };
}

export default function YogaPage() {
  const router = useRouter();
  const [yogaSessions, setYogaSessions] = useState<YogaSession[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<YogaSession | null>(
    null
  );
  const [selectedDailySession, setSelectedDailySession] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [dailySessions, setDailySessions] = useState<any[]>([]);
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

  useEffect(() => {
    fetchYogaSessions();
    fetchTeachers();
    fetchDailySessions();
  }, []);

  const fetchYogaSessions = async () => {
    try {
      const response = await yogaAPI.getAllSessions({ upcoming: "true" });
      if (response.data.success) {
        setYogaSessions(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching yoga sessions:", error);
    }
  };

  const fetchTeachers = async () => {
    try {
      const response = await yogaAPI.getAllTeachers();
      if (response.data.success) {
        setTeachers(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching teachers:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDailySessions = async () => {
    try {
      const response = await yogaAPI.getAllDailySessions();
      if (response.data.success) {
        setDailySessions(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching daily sessions:", error);
    }
  };

  const handleBookSession = (session: YogaSession) => {
    console.log("Booking session:", session._id);
    // Redirect to our internal booking system with program type
    router.push(`/yoga/booking/details?session=${session._id}&type=program`);
  };

  const handleDailySessionBooking = () => {
    if (!selectedDailySession) {
      alert("Please select a session time");
      return;
    }
    if (!selectedDate) {
      alert("Please select a date");
      return;
    }

    // Redirect to booking with daily session details
    router.push(
      `/yoga/booking/details?session=${selectedDailySession}&type=daily&date=${selectedDate}`
    );
  };

  const handleExternalBooking = () => {
    console.log("External booking button clicked");
    // Redirect to our internal booking system (for general booking)
    router.push("/yoga/booking/details");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const SessionCard = ({ session }: { session: YogaSession }) => {
    const duration = Math.ceil(
      (new Date(session.endDate).getTime() -
        new Date(session.startDate).getTime()) /
        (1000 * 60 * 60 * 24)
    );

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-shadow"
      >
        <div className="h-64 bg-gradient-to-br from-orange-400 to-pink-500 relative">
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute top-4 left-4">
            <span
              className={`px-3 py-1 rounded-full text-sm font-semibold ${
                session.type === "200hr"
                  ? "bg-green-100 text-green-800"
                  : "bg-purple-100 text-purple-800"
              }`}
            >
              {session.type} Training
            </span>
          </div>
          <div className="absolute bottom-4 left-4 text-white">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4" />
              <span>{duration} days</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>
                {session.capacity - session.bookedSeats}/{session.capacity}{" "}
                available
              </span>
            </div>
          </div>
        </div>

        <div className="p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {session.batchName}
          </h3>
          <p className="text-gray-600 text-sm mb-4 line-clamp-3">
            {session.description ||
              `${session.type} Yoga Teacher Training program with comprehensive curriculum covering asanas, pranayama, meditation, and teaching methodology.`}
          </p>

          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                Instructor: {session.instructor.name}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                {formatDate(session.startDate)} - {formatDate(session.endDate)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                {session.schedule.days.join(", ")} at {session.schedule.time}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-orange-600">
                ₹{session.price.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">per person</div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setSelectedSession(session)}
                className="px-4 py-2 border border-orange-600 text-orange-600 font-semibold rounded-lg hover:bg-orange-50 transition-colors"
              >
                View Details
              </button>
              <button
                onClick={() => handleBookSession(session)}
                className="px-4 py-2 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition-colors"
                disabled={session.bookedSeats >= session.capacity}
              >
                {session.bookedSeats >= session.capacity ? "Full" : "Book Now"}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section with Parallax */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Parallax Background */}
        <motion.div style={{ y }} className="absolute inset-0 z-0">
          <div
            className="w-full h-[120%] bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage:
                "url(https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80)",
            }}
          />
        </motion.div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 z-10 bg-gradient-to-r from-orange-900/80 via-pink-900/70 to-purple-900/80" />

        {/* Floating Particles Animation */}
        <div className="absolute inset-0 z-20">
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-white/20 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [-20, -80, -20],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 4 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 3,
              }}
            />
          ))}
        </div>

        {/* Hero Content */}
        <div className="relative z-30 text-center text-white px-4 max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="mb-12"
          >
            {/* Decorative Element */}
            <motion.div
              className="flex justify-center mb-8"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.3 }}
            >
              <div className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center">
                <Activity className="w-10 h-10 text-orange-300" />
              </div>
            </motion.div>

            <motion.h1
              className="text-6xl md:text-8xl font-extralight mb-8 tracking-wide"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.5 }}
            >
              <span className="bg-gradient-to-r from-white to-orange-200 bg-clip-text text-transparent">
                Yoga & Wellness
              </span>
            </motion.h1>

            <motion.p
              className="text-2xl md:text-3xl font-light opacity-90 max-w-4xl mx-auto leading-relaxed mb-8"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.7 }}
            >
              Transform your body, mind, and soul through authentic yoga
              practices in Kerala's most serene retreat
            </motion.p>

            {/* Quick Stats */}
            <motion.div
              className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto mb-12"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.9 }}
            >
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-300">200+</div>
                <div className="text-sm text-white/80">Students Trained</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-pink-300">5+</div>
                <div className="text-sm text-white/80">Expert Teachers</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-300">10+</div>
                <div className="text-sm text-white/80">Years Experience</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-300">24/7</div>
                <div className="text-sm text-white/80">Support</div>
              </div>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row gap-6 justify-center items-center"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 1.1 }}
            >
              <button
                onClick={() => {
                  const element = document.getElementById("programs-section");
                  element?.scrollIntoView({ behavior: "smooth" });
                }}
                className="group bg-gradient-to-r from-orange-600 to-pink-600 hover:from-orange-700 hover:to-pink-700 text-white px-10 py-4 rounded-2xl text-lg font-semibold transition-all duration-300 shadow-2xl hover:shadow-orange-500/25 transform hover:-translate-y-1 flex items-center gap-3"
              >
                <Calendar className="w-6 h-6" />
                View Programs
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => {
                  const element = document.getElementById(
                    "daily-sessions-section"
                  );
                  element?.scrollIntoView({ behavior: "smooth" });
                }}
                className="group bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white px-10 py-4 rounded-2xl text-lg font-semibold transition-all duration-300 hover:bg-white/20 flex items-center gap-3"
              >
                <BookOpen className="w-6 h-6" />
                Book Daily Session
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
            <motion.div
              className="w-1 h-3 bg-white/70 rounded-full mt-2"
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </motion.div>
      </section>

      {/* Programs Section */}
      <section
        id="programs-section"
        className="py-32 bg-gradient-to-br from-gray-50 to-blue-50"
      >
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl md:text-6xl font-extralight text-gray-900 mb-6">
              Yoga{" "}
              <span className="bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
                Programs
              </span>
            </h2>
            <p className="text-2xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive teacher training programs designed to deepen your
              practice and transform your life
            </p>
          </motion.div>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center py-20">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 border-4 border-orange-200 border-t-orange-600 rounded-full"
              />
            </div>
          )}

          {/* Dynamic Programs from API */}
          {!loading && yogaSessions.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {yogaSessions.map((session, index) => {
                const colorTheme =
                  session.type === "200hr"
                    ? {
                        primary: "orange",
                        gradient: "from-orange-600 to-pink-600",
                        bg: "bg-orange-100",
                        text: "text-orange-800",
                        accent: "text-orange-500",
                        bgColor: "bg-orange-500",
                      }
                    : {
                        primary: "purple",
                        gradient: "from-purple-600 to-pink-600",
                        bg: "bg-purple-100",
                        text: "text-purple-800",
                        accent: "text-purple-500",
                        bgColor: "bg-purple-500",
                      };

                const programImage =
                  session.type === "200hr"
                    ? "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
                    : "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80";

                return (
                  <motion.div
                    key={session._id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                  >
                    {/* Compact Image */}
                    <div className="relative h-48 overflow-hidden">
                      <div
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-110"
                        style={{ backgroundImage: `url('${programImage}')` }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                      {/* Session Type Badge */}
                      <div className="absolute top-3 left-3">
                        <span
                          className={`px-3 py-1 ${colorTheme.bgColor} text-white rounded-full text-xs font-semibold`}
                        >
                          {session.type} TTC
                        </span>
                      </div>

                      {/* Available Seats */}
                      <div className="absolute top-3 right-3">
                        <span className="px-2 py-1 bg-white/20 backdrop-blur-sm text-white rounded-full text-xs">
                          {session.availableSeats ||
                            session.capacity - session.bookedSeats}{" "}
                          seats
                        </span>
                      </div>

                      {/* Title and Rating */}
                      <div className="absolute bottom-3 left-3 right-3 text-white">
                        <h3 className="text-lg font-bold mb-1 truncate">
                          {session.batchName}
                        </h3>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="text-sm">4.9</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Compact Content */}
                    <div className="p-6">
                      {/* Basic Info */}
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-gray-600 text-sm">
                          <Calendar className="w-4 h-4" />
                          <span className="truncate">
                            {new Date(session.startDate).toLocaleDateString(
                              "en-GB",
                              { day: "2-digit", month: "short" }
                            )}{" "}
                            -{" "}
                            {new Date(session.endDate).toLocaleDateString(
                              "en-GB",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              }
                            )}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 text-sm">
                          <Clock className="w-4 h-4" />
                          <span>{session.schedule.time}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 text-sm">
                          <Users className="w-4 h-4" />
                          <span>Max {session.capacity} students</span>
                        </div>
                      </div>

                      {/* Price and Actions */}
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <div className="text-2xl font-bold text-gray-900">
                            ₹{session.price.toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-500">
                            All inclusive
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedSession(session)}
                          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                        >
                          View Details
                        </button>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className={`flex-1 px-4 py-2 bg-gradient-to-r ${colorTheme.gradient} text-white rounded-lg hover:shadow-lg transition-all duration-300 text-sm font-semibold`}
                        >
                          Enroll Now
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            !loading && (
              /* No Programs Available */
              <div className="text-center py-20">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="max-w-md mx-auto"
                >
                  <div className="w-24 h-24 bg-gradient-to-r from-orange-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Activity className="w-12 h-12 text-orange-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    No Programs Available
                  </h3>
                  <p className="text-gray-600 mb-8">
                    Check back soon for upcoming yoga teacher training programs
                    and workshops.
                  </p>
                  <button
                    onClick={() => router.push("/contact")}
                    className="px-6 py-3 bg-gradient-to-r from-orange-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
                  >
                    Contact Us for Updates
                  </button>
                </motion.div>
              </div>
            )
          )}
        </div>
      </section>

      {/* Daily Yoga Sessions Section */}
      <section
        id="daily-sessions-section"
        className="py-20 bg-gradient-to-br from-slate-900 via-gray-900 to-blue-900"
      >
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl md:text-6xl font-extralight text-white mb-6">
              Daily Yoga{" "}
              <span className="bg-gradient-to-r from-orange-400 to-pink-400 bg-clip-text text-transparent">
                Sessions
              </span>
            </h2>
            <p className="text-2xl text-gray-300 max-w-3xl mx-auto">
              Choose your preferred time and join our transformative yoga
              classes
            </p>
          </motion.div>

          {/* Dynamic Session Types */}
          <div className="grid lg:grid-cols-2 gap-12 mb-16">
            {dailySessions.map((session, index) => {
              const isRegular = session.type === 'regular';
              const colorTheme = isRegular
                ? {
                    bg: 'bg-orange-500/20',
                    icon: 'text-orange-400',
                    price: 'text-orange-200',
                    duration: 'text-orange-300',
                    check: 'text-orange-400'
                  }
                : {
                    bg: 'bg-purple-500/20',
                    icon: 'text-purple-400',
                    price: 'text-purple-200',
                    duration: 'text-purple-300',
                    check: 'text-purple-400'
                  };

              return (
                <motion.div
                  key={session._id}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8 }}
                  className="bg-white/10 backdrop-blur-lg rounded-3xl p-8"
                >
                  <div className="flex items-center gap-4 mb-8">
                    <div className={`w-16 h-16 ${colorTheme.bg} rounded-2xl flex items-center justify-center`}>
                      {isRegular ? (
                        <Activity className={`w-8 h-8 ${colorTheme.icon}`} />
                      ) : (
                        <Heart className={`w-8 h-8 ${colorTheme.icon}`} />
                      )}
                    </div>
                    <div>
                      <h3 className="text-3xl font-bold text-white">
                        {session.name}
                      </h3>
                      <p className={`text-xl ${colorTheme.price} font-semibold`}>
                        ₹{session.price.toLocaleString()} per session
                      </p>
                      <p className={`${colorTheme.duration} text-sm`}>
                        {session.duration} minute session
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4 mb-8">
                    <div className="bg-white/10 rounded-xl p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <Clock className={`w-5 h-5 ${colorTheme.icon}`} />
                        <span className="text-white font-semibold">
                          Available Times
                        </span>
                      </div>
                      <div className="space-y-2 ml-8">
                        {session.timeSlots?.filter((slot: any) => slot.isActive).map((slot: any, idx: number) => {
                          const timeFormatted = slot.time.length === 5 ? slot.time : `0${slot.time}`;
                          const [hours, minutes] = timeFormatted.split(':');
                          const hour12 = parseInt(hours) > 12 ? parseInt(hours) - 12 : parseInt(hours);
                          const ampm = parseInt(hours) >= 12 ? 'PM' : 'AM';
                          const displayTime = `${hour12 === 0 ? 12 : hour12}:${minutes} ${ampm}`;
                          const endHour = parseInt(hours) + Math.floor(session.duration / 60);
                          const endMinutes = parseInt(minutes) + (session.duration % 60);
                          const endHour12 = endHour > 12 ? endHour - 12 : endHour;
                          const endAmpm = endHour >= 12 ? 'PM' : 'AM';
                          const endDisplayTime = `${endHour12 === 0 ? 12 : endHour12}:${endMinutes.toString().padStart(2, '0')} ${endAmpm}`;

                          return (
                            <div key={idx} className={`${colorTheme.price}`}>
                              {displayTime} - {endDisplayTime}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 mb-8">
                    {session.features?.map((feature: string, idx: number) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: idx * 0.1 }}
                        className="flex items-center gap-3 text-white/90"
                      >
                        <CheckCircle className={`w-5 h-5 ${colorTheme.check}`} />
                        <span>{feature}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Interactive Booking Section */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 max-w-4xl mx-auto"
          >
            <div className="text-center mb-8">
              <h3 className="text-3xl font-bold text-white mb-4">
                Book Your Session
              </h3>
              <p className="text-gray-300">
                Select your preferred date and time slot
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Date Selection */}
              <div>
                <label className="block text-white font-semibold mb-4">
                  Select Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full p-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/20"
                />
              </div>

              {/* Time Selection */}
              <div>
                <label className="block text-white font-semibold mb-4">
                  Select Session Type & Time
                </label>
                <select
                  value={selectedDailySession}
                  onChange={(e) => setSelectedDailySession(e.target.value)}
                  className="w-full p-4 rounded-xl bg-white/10 border border-white/20 text-white focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/20"
                >
                  <option value="" className="bg-gray-800">
                    Choose a session...
                  </option>
                  {dailySessions.map((session) => (
                    <optgroup
                      key={session._id}
                      label={`${session.name} - ₹${session.price.toLocaleString()}`}
                      className="bg-gray-800"
                    >
                      {session.timeSlots?.filter((slot: any) => slot.isActive).map((slot: any, idx: number) => {
                        const timeFormatted = slot.time.length === 5 ? slot.time : `0${slot.time}`;
                        const [hours, minutes] = timeFormatted.split(':');
                        const hour12 = parseInt(hours) > 12 ? parseInt(hours) - 12 : parseInt(hours);
                        const ampm = parseInt(hours) >= 12 ? 'PM' : 'AM';
                        const displayTime = `${hour12 === 0 ? 12 : hour12}:${minutes} ${ampm}`;
                        const endHour = parseInt(hours) + Math.floor(session.duration / 60);
                        const endMinutes = parseInt(minutes) + (session.duration % 60);
                        const endHour12 = endHour > 12 ? endHour - 12 : endHour;
                        const endAmpm = endHour >= 12 ? 'PM' : 'AM';
                        const endDisplayTime = `${endHour12 === 0 ? 12 : endHour12}:${endMinutes.toString().padStart(2, '0')} ${endAmpm}`;

                        return (
                          <option
                            key={idx}
                            value={`${session.type}-${slot.time.replace(':', '')}`}
                            className="bg-gray-800"
                          >
                            {displayTime} - {endDisplayTime}
                          </option>
                        );
                      })}
                    </optgroup>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-8 text-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleDailySessionBooking}
                className="bg-gradient-to-r from-orange-600 to-pink-600 hover:from-orange-700 hover:to-pink-700 text-white px-12 py-4 rounded-2xl text-xl font-bold shadow-2xl flex items-center justify-center gap-3 mx-auto disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!selectedDate || !selectedDailySession}
              >
                <Calendar className="w-6 h-6" />
                Book Your Yoga Session
                <ArrowRight className="w-6 h-6" />
              </motion.button>
            </div>

            <div className="mt-6 text-center">
              <p className="text-gray-400 text-sm">
                <Clock className="w-4 h-4 inline mr-2" />
                Booking confirmation will be sent via email
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-light text-gray-900 mb-4">
              Why Choose Kshetra
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Experience authentic yoga in one of the world's most spiritual
              destinations
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center p-6"
            >
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Certified Instructors
              </h3>
              <p className="text-gray-600">
                Learn from experienced, internationally certified yoga teachers
                with deep knowledge of traditional practices
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center p-6"
            >
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Perfect Location
              </h3>
              <p className="text-gray-600">
                Practice yoga steps away from Varkala Beach, surrounded by the
                natural beauty and spiritual energy of Kerala
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center p-6"
            >
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Holistic Approach
              </h3>
              <p className="text-gray-600">
                Our programs integrate asanas, pranayama, meditation,
                philosophy, and Ayurvedic principles for complete wellness
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Instructors Section */}
      {teachers.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-light text-gray-900 mb-4">
                Meet Our Teachers
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Learn from experienced masters who embody the true spirit of
                yoga
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {teachers.slice(0, 6).map((teacher, index) => (
                <motion.div
                  key={teacher._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl shadow-sm overflow-hidden"
                >
                  <div className="h-64 bg-gray-200 flex items-center justify-center">
                    {teacher.profileImage ? (
                      <img
                        src={teacher.profileImage}
                        alt={teacher.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center">
                        <span className="text-2xl font-bold text-orange-600">
                          {teacher.name[0]}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">
                      {teacher.name}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                      <span>{teacher.experience} years experience</span>
                      <span>•</span>
                      <span>{teacher.specializations[0]}</span>
                    </div>
                    <p className="text-gray-600 text-sm line-clamp-3">
                      {teacher.bio}
                    </p>

                    {teacher.certifications.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {teacher.certifications.slice(0, 2).map((cert, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full"
                          >
                            {cert}
                          </span>
                        ))}
                        {teacher.certifications.length > 2 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                            +{teacher.certifications.length - 2} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      {/* <section className="py-16 bg-gradient-to-r from-orange-600 to-pink-600">
        <div className="container mx-auto px-4 text-center text-white">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-light mb-4">
              Start Your Yoga Journey Today
            </h2>
            <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
              Whether you're a complete beginner or experienced practitioner, we
              have the perfect program for you
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleExternalBooking}
                className="px-8 py-3 bg-white text-orange-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
              >
                Book Now
              </button>
              <button
                onClick={() => router.push("/contact")}
                className="px-8 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-orange-600 transition-colors"
              >
                Contact Us
              </button>
            </div>
          </motion.div>
        </div>
      </section> */}

      {/* Session Details Modal */}
      {selectedSession && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl max-w-4xl max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-gray-900">
                  {selectedSession.batchName}
                </h2>
                <button
                  onClick={() => setSelectedSession(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Program Details
                  </h3>
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-600">
                        {selectedSession.type} Training Program
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-600">
                        {formatDate(selectedSession.startDate)} -{" "}
                        {formatDate(selectedSession.endDate)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-600">
                        {selectedSession.schedule.days.join(", ")} at{" "}
                        {selectedSession.schedule.time}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-600">
                        {selectedSession.capacity - selectedSession.bookedSeats}{" "}
                        spots available (out of {selectedSession.capacity})
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-600">
                        Instructor: {selectedSession.instructor.name}
                      </span>
                    </div>
                  </div>

                  {selectedSession.description && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">
                        Description
                      </h3>
                      <p className="text-gray-600">
                        {selectedSession.description}
                      </p>
                    </div>
                  )}

                  {selectedSession.prerequisites.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">
                        Prerequisites
                      </h3>
                      <ul className="space-y-2">
                        {selectedSession.prerequisites.map((prereq, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-blue-600" />
                            <span className="text-gray-600">{prereq}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div>
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <div className="text-3xl font-bold text-orange-600 mb-2">
                      ₹{selectedSession.price.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600 mb-6">
                      {selectedSession.type} •{" "}
                      {Math.ceil(
                        (new Date(selectedSession.endDate).getTime() -
                          new Date(selectedSession.startDate).getTime()) /
                          (1000 * 60 * 60 * 24)
                      )}{" "}
                      days
                    </div>

                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Available spots:</span>
                        <span className="font-semibold">
                          {selectedSession.capacity -
                            selectedSession.bookedSeats}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total capacity:</span>
                        <span className="font-semibold">
                          {selectedSession.capacity}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleBookSession(selectedSession)}
                      className="w-full px-4 py-3 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition-colors disabled:bg-gray-400"
                      disabled={
                        selectedSession.bookedSeats >= selectedSession.capacity
                      }
                    >
                      {selectedSession.bookedSeats >= selectedSession.capacity
                        ? "Fully Booked"
                        : "Book This Program"}
                    </button>
                  </div>

                  {selectedSession.instructor.bio && (
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">
                        About Your Instructor
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {selectedSession.instructor.bio}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      <Footer />
    </div>
  );
}
