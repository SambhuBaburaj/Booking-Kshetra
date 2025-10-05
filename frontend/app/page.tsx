"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import {
  Calendar,
  Users,
  Star,
  Hotel,
  Activity,
  Car,
  Bike,
  Camera,
  Waves,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Wifi,
  Coffee,
  Car as CarIcon,
  Utensils,
  Flower2,
  TreePine,
  Mountain,
  Sunset,
  MapPin,
  Phone,
  Mail,
  Clock,
  Award,
  Heart,
  Shield,
  CheckCircle2,
  Bath,
  Bed,
  AirVent,
  Tv,
  Plane,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function Home() {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [hoveredRoomType, setHoveredRoomType] = useState<
    "king" | "queen" | "dormitory" | null
  >(null);
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

  // Room type images
  const roomImages = {
    king: [
      "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1566665797739-1674de7a421a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1520637836862-4d197d17c881?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    ],
    queen: [
      "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1540518614846-7eded47d24e5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    ],
    dormitory: [
      "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1595814432314-90095f342694?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    ],
    default: [
      "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    ],
  };

  const mainServices = [
    {
      title: "Room Booking",
      category: "Accommodation",
      description:
        "Book your perfect stay at Kshetra Retreat Resort with our comfortable AC and Non-AC rooms, featuring modern amenities and serene views of Kerala's natural beauty.",
      features: [
        "AC & Non-AC Rooms Available",
        "Modern Amenities & Comfort",
        "Scenic Views of Kerala",
        "24/7 Room Service",
        "Free WiFi & Hot Water",
      ],
      price: "Starting from ₹2,500/night",
      image:
        "https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
      icon: Hotel,
      onClick: () =>
        window.open(
          "https://live.ipms247.com/booking/book-rooms-kshetraretreatvarkala",
          "_blank"
        ),
      color: "from-blue-600 to-blue-800",
    },
    {
      title: "Airport Transport",
      category: "Transportation",
      description:
        "Seamless airport pickup and drop services with professional drivers, flight tracking, and comfortable vehicles. Choose your terminal, add flight details, and enjoy hassle-free transfers.",
      features: [
        "Professional Airport Transfers",
        "Flight Delay Monitoring",
        "Terminal Selection (T1/T2/T3)",
        "Meet & Greet Service",
        "24/7 Support Available",
      ],
      price: "From ₹1,500/transfer",
      image:
        "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
      icon: Car,
      onClick: () => router.push("/airport-transport"),
      color: "from-purple-600 to-indigo-800",
    },
    {
      title: "Yoga Sessions",
      category: "Wellness",
      description:
        "Transform your life through authentic yoga practice with our certified instructors. Join our 200hr & 300hr teacher training programs or daily yoga sessions.",
      features: [
        "200hr & 300hr Teacher Training",
        "Daily Morning & Evening Sessions",
        "Certified International Instructors",
        "Beach-side Yoga Practice",
        "Meditation & Pranayama",
      ],
      price: "From ₹1,500/session",
      image:
        "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
      icon: Activity,
      onClick: () => router.push("/yoga"),
      color: "from-orange-500 to-pink-600",
    },
    {
      title: "Adventure Services",
      category: "Activities",
      description:
        "Enhance your stay with our curated selection of services including bike rentals, surfing lessons, and local sightseeing tours for an unforgettable Kerala experience.",
      features: [
        "Bike Rentals for Exploration",
        "Professional Surfing Lessons",
        "Local Sightseeing Tours",
        "Cultural Experience Packages",
        "Adventure Activity Packages",
      ],
      price: "From ₹500/service",
      image:
        "https://images.unsplash.com/photo-1502680390469-be75c86b636f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
      icon: Camera,
      onClick: () => router.push("/services"),
      color: "from-green-500 to-teal-600",
    },
  ];

  const testimonials = [
    {
      text: "Kshetra Retreat provided the perfect blend of relaxation and adventure. The yoga sessions were transformative!",
      author: "Sarah Johnson",
      location: "California, USA",
      rating: 5,
    },
    {
      text: "The room booking process was seamless and the accommodations exceeded our expectations. Beautiful location!",
      author: "Raj Patel",
      location: "Mumbai, India",
      rating: 5,
    },
    {
      text: "Amazing services! The surfing lessons were incredible and the bike rentals made exploring Kerala so easy.",
      author: "Maria Santos",
      location: "São Paulo, Brazil",
      rating: 5,
    },
  ];

  // Carousel auto-slide effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % mainServices.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  // Testimonials auto-slide effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % mainServices.length);
  };

  const prevSlide = () => {
    setCurrentSlide(
      (prev) => (prev - 1 + mainServices.length) % mainServices.length
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section - Split Layout with Beach Background */}
      <section className="relative min-h-screen overflow-hidden bg-gray-50">
        {/* Parallax Background */}
        <motion.div style={{ y }} className="absolute inset-0 scale-110">
          <img
            src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
            alt="Varkala Beach"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
        </motion.div>

        {/* Content - Split Layout */}
        <div className="relative z-10 min-h-screen flex items-center">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center min-h-screen">
              {/* Left Side - Content */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 1 }}
                className="text-white lg:pr-8"
              >
                {/* Pre-title */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mb-8"
                >
                  <div className="inline-flex items-center gap-2 text-orange-400 text-sm font-medium uppercase tracking-wider mb-4">
                    <div className="w-8 h-px bg-orange-400" />
                    <span>Luxury Resort</span>
                  </div>
                </motion.div>

                {/* Main Title */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="mb-8"
                >
                  <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold leading-none mb-6">
                    <span className="block text-white">Kshetra</span>
                    <span className="block text-orange-400 text-5xl md:text-6xl lg:text-7xl font-light">
                      Retreat Resort
                    </span>
                  </h1>
                </motion.div>

                {/* Description */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="mb-10"
                >
                  <p className="text-xl md:text-2xl text-white/90 font-light leading-relaxed max-w-lg">
                    Experience the perfect blend of luxury, wellness, and
                    natural beauty at Kerala's most stunning beachfront
                    destination.
                  </p>
                </motion.div>

                {/* Location */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="mb-12"
                >
                  <div className="flex items-center gap-3 text-white/80">
                    <MapPin className="w-5 h-5 text-orange-400" />
                    <span className="text-lg font-light">
                      Varkala Beach, Kerala
                    </span>
                  </div>
                </motion.div>

                {/* CTA Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 }}
                  className="flex flex-col sm:flex-row gap-4"
                >
                  <button
                    onClick={() =>
                      window.open(
                        "https://live.ipms247.com/booking/book-rooms-kshetraretreatvarkala",
                        "_blank"
                      )
                    }
                    className="group px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white font-semibold text-lg rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    Book Your Stay
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>

                  <button
                    onClick={() => router.push("/yoga")}
                    className="group px-8 py-4 bg-transparent border-2 border-white hover:bg-white hover:text-gray-900 text-white font-semibold text-lg rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    Explore More
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </motion.div>
              </motion.div>

              {/* Right Side - Empty for image showcase */}
              <div className="hidden lg:block">
                {/* This space intentionally left for the background image to show */}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Services Carousel Section */}
      <section className="py-20 bg-gradient-to-br from-slate-900 via-gray-900 to-blue-900">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl md:text-6xl font-extralight text-white mb-6">
              Our Main{" "}
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Attractions
              </span>
            </h2>
            <p className="text-2xl text-gray-300 max-w-3xl mx-auto">
              Discover the three pillars of your perfect retreat experience
            </p>
          </motion.div>

          {/* Services Carousel */}
          <div className="relative max-w-7xl mx-auto">
            {/* Carousel Container */}
            <div className="relative overflow-hidden rounded-3xl">
              <motion.div
                className="flex transition-transform duration-700 ease-in-out"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {mainServices.map((service, index) => (
                  <div key={service.title} className="w-full flex-shrink-0">
                    <div className="relative min-h-[60vh] md:min-h-[70vh] flex items-center justify-center overflow-hidden py-12 md:py-16">
                      {/* Background Image with Parallax */}
                      <div
                        className="absolute inset-0 bg-cover bg-center bg-no-repeat transform scale-105"
                        style={{ backgroundImage: `url('${service.image}')` }}
                      />
                      <div
                        className={`absolute inset-0 bg-gradient-to-r ${service.color} opacity-80`}
                      />

                      {/* Content */}
                      <div className="relative z-10 text-white text-center px-4 md:px-8 max-w-6xl mx-auto">
                        <motion.div
                          initial={{ opacity: 0, y: 50 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.8 }}
                          className="space-y-4 md:space-y-6 lg:space-y-8"
                        >
                          <div className="flex justify-center mb-4 md:mb-6">
                            <div className="w-16 h-16 md:w-20 md:h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                              <service.icon className="w-8 h-8 md:w-10 md:h-10 text-white" />
                            </div>
                          </div>

                          <span className="inline-block px-3 py-1 md:px-4 md:py-2 bg-white/20 backdrop-blur-sm rounded-full text-xs md:text-sm font-medium">
                            {service.category}
                          </span>

                          <h3 className="text-3xl md:text-5xl lg:text-6xl font-bold">
                            {service.title}
                          </h3>

                          <p className="text-lg md:text-xl lg:text-2xl opacity-90 max-w-4xl mx-auto leading-relaxed">
                            {service.description}
                          </p>

                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 md:gap-4 max-w-4xl mx-auto">
                            {service.features.map((feature, idx) => (
                              <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: idx * 0.1 }}
                                className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-2 py-1 md:px-3 md:py-2"
                              >
                                <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-white rounded-full flex-shrink-0" />
                                <span className="text-xs md:text-sm font-medium">
                                  {feature}
                                </span>
                              </motion.div>
                            ))}
                          </div>

                          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6">
                            <div className="text-2xl md:text-3xl font-bold">
                              {service.price}
                            </div>
                            <button
                              onClick={service.onClick}
                              className="group bg-white text-gray-900 px-6 py-3 md:px-8 md:py-4 rounded-xl text-base md:text-lg font-bold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 flex items-center gap-3"
                            >
                              Book Now
                              <ArrowRight className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-2 transition-transform" />
                            </button>
                          </div>
                        </motion.div>
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Carousel Navigation */}
            <div className="flex items-center justify-center mt-8 gap-4">
              <button
                onClick={prevSlide}
                className="w-12 h-12 bg-white/20 backdrop-blur-sm shadow-lg rounded-full flex items-center justify-center hover:bg-white/30 transition-colors group"
              >
                <ChevronLeft className="w-6 h-6 text-white group-hover:text-gray-200" />
              </button>

              {/* Dots Indicator */}
              <div className="flex gap-2">
                {mainServices.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === currentSlide
                        ? "bg-blue-400 w-8"
                        : "bg-white/30 hover:bg-white/50"
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={nextSlide}
                className="w-12 h-12 bg-white/20 backdrop-blur-sm shadow-lg rounded-full flex items-center justify-center hover:bg-white/30 transition-colors group"
              >
                <ChevronRight className="w-6 h-6 text-white group-hover:text-gray-200" />
              </button>
            </div>
          </div>

          {/* Quick Service Cards */}
          <div className="mt-20 grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {mainServices.map((service, index) => (
              <motion.div
                key={`quick-${service.title}`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                onClick={service.onClick}
                className={`group cursor-pointer bg-gradient-to-br ${service.color} p-8 rounded-2xl text-white hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2`}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                    <service.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold">{service.title}</h4>
                    <p className="text-sm opacity-90">{service.category}</p>
                  </div>
                </div>
                <p className="text-lg font-semibold mb-4">{service.price}</p>
                <div className="flex items-center gap-2 text-white/90 group-hover:text-white transition-colors">
                  <span className="text-sm font-medium">Book Now</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Carousel */}
      <section className="py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl md:text-6xl font-extralight text-white mb-6">
              What Our Guests Say
            </h2>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Real experiences from travelers who found their perfect retreat
            </p>
          </motion.div>

          <div className="relative max-w-4xl mx-auto">
            <div className="overflow-hidden">
              <motion.div
                className="flex transition-transform duration-500 ease-in-out"
                style={{
                  transform: `translateX(-${currentTestimonial * 100}%)`,
                }}
              >
                {testimonials.map((testimonial, index) => (
                  <div key={index} className="w-full flex-shrink-0">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.8 }}
                      className="bg-white/10 backdrop-blur-sm rounded-3xl p-12 text-center text-white"
                    >
                      <div className="flex justify-center mb-6">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star
                            key={i}
                            className="w-8 h-8 fill-yellow-400 text-yellow-400 mx-1"
                          />
                        ))}
                      </div>

                      <blockquote className="text-2xl md:text-3xl font-light mb-8 leading-relaxed italic">
                        "{testimonial.text}"
                      </blockquote>

                      <div className="text-xl font-semibold mb-2">
                        {testimonial.author}
                      </div>
                      <div className="text-lg opacity-80">
                        {testimonial.location}
                      </div>
                    </motion.div>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Testimonial Indicators */}
            <div className="flex justify-center mt-8 gap-3">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentTestimonial
                      ? "bg-white w-8"
                      : "bg-white/50 hover:bg-white/70"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Detailed Room Booking Section with Parallax */}
      <section className="relative py-32 overflow-hidden">
        {/* Parallax Background */}
        <motion.div
          style={{
            y: useTransform(scrollYProgress, [0.3, 0.7], ["0%", "-20%"]),
          }}
          className="absolute inset-0 z-0"
        >
          <div
            className="w-full h-[120%] bg-cover bg-center bg-fixed"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')`,
            }}
          />
        </motion.div>

        <div className="absolute inset-0 bg-black/60 z-10" />

        <div className="relative z-20 container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center text-white mb-16"
          >
            <h2 className="text-6xl md:text-7xl font-extralight mb-6">
              Luxury{" "}
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Accommodation
              </span>
            </h2>
            <p className="text-2xl md:text-3xl opacity-90 max-w-4xl mx-auto leading-relaxed">
              Choose from our carefully designed rooms that blend traditional
              Kerala architecture with modern luxury
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Room Details */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8">
                <h3 className="text-4xl font-bold text-white mb-6 flex items-center gap-3">
                  <Hotel className="w-10 h-10 text-blue-400" />
                  Our Rooms & Suites
                </h3>

                <div className="space-y-6">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    onMouseEnter={() => setHoveredRoomType("king")}
                    onMouseLeave={() => setHoveredRoomType(null)}
                    onClick={() =>
                      window.open(
                        "https://live.ipms247.com/booking/book-rooms-kshetraretreatvarkala",
                        "_blank"
                      )
                    }
                    className={`flex items-center gap-4 text-white cursor-pointer p-4 rounded-lg transition-all duration-300 ${
                      hoveredRoomType === "king"
                        ? "bg-blue-500/20 shadow-lg shadow-blue-500/25"
                        : "hover:bg-white/10"
                    }`}
                  >
                    <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <Bed className="w-6 h-6 text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xl font-semibold">King Sized Room</h4>
                      <p className="text-white/80">
                        Spacious room with king-size bed and premium amenities
                      </p>
                      <p className="text-blue-400 font-semibold mt-1">
                        Starting from ₹3,500/night
                      </p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-white/60 group-hover:text-white transition-colors" />
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    onMouseEnter={() => setHoveredRoomType("queen")}
                    onMouseLeave={() => setHoveredRoomType(null)}
                    onClick={() =>
                      window.open(
                        "https://live.ipms247.com/booking/book-rooms-kshetraretreatvarkala",
                        "_blank"
                      )
                    }
                    className={`flex items-center gap-4 text-white cursor-pointer p-4 rounded-lg transition-all duration-300 ${
                      hoveredRoomType === "queen"
                        ? "bg-green-500/20 shadow-lg shadow-green-500/25"
                        : "hover:bg-white/10"
                    }`}
                  >
                    <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                      <Bed className="w-6 h-6 text-green-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xl font-semibold">
                        Queen Sized Room
                      </h4>
                      <p className="text-white/80">
                        Comfortable room with queen-size bed and modern
                        facilities
                      </p>
                      <p className="text-green-400 font-semibold mt-1">
                        Starting from ₹2,800/night
                      </p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-white/60 group-hover:text-white transition-colors" />
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    onMouseEnter={() => setHoveredRoomType("dormitory")}
                    onMouseLeave={() => setHoveredRoomType(null)}
                    onClick={() =>
                      window.open(
                        "https://live.ipms247.com/booking/book-rooms-kshetraretreatvarkala",
                        "_blank"
                      )
                    }
                    className={`flex items-center gap-4 text-white cursor-pointer p-4 rounded-lg transition-all duration-300 ${
                      hoveredRoomType === "dormitory"
                        ? "bg-purple-500/20 shadow-lg shadow-purple-500/25"
                        : "hover:bg-white/10"
                    }`}
                  >
                    <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                      <Users className="w-6 h-6 text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xl font-semibold">Dormitory</h4>
                      <p className="text-white/80">
                        Shared accommodation perfect for budget travelers and
                        groups
                      </p>
                      <p className="text-purple-400 font-semibold mt-1">
                        Starting from ₹1,200/night per bed
                      </p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-white/60 group-hover:text-white transition-colors" />
                  </motion.div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mt-8">
                  {[
                    { icon: AirVent, text: "Air Conditioning" },
                    { icon: Wifi, text: "Free WiFi" },
                    { icon: Tv, text: "Smart TV" },
                    { icon: Bath, text: "Private Bathroom" },
                    { icon: Coffee, text: "Tea/Coffee Maker" },
                    { icon: Shield, text: "24/7 Security" },
                  ].map((amenity, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: idx * 0.1 }}
                      className="flex items-center gap-3 text-white/90"
                    >
                      <amenity.icon className="w-5 h-5 text-blue-400" />
                      <span>{amenity.text}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() =>
                  window.open(
                    "https://live.ipms247.com/booking/book-rooms-kshetraretreatvarkala",
                    "_blank"
                  )
                }
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white py-6 px-8 rounded-2xl text-xl font-bold shadow-2xl flex items-center justify-center gap-3 group"
              >
                <Hotel className="w-6 h-6" />
                Book Your Perfect Room Now
                <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
              </motion.button>
            </motion.div>

            {/* Room Images Gallery */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              {/* Room Type Indicator */}
              <div className="mb-4 text-center">
                <p className="text-white/60 text-sm">
                  {hoveredRoomType
                    ? `Viewing ${
                        hoveredRoomType === "king"
                          ? "King Sized Room"
                          : hoveredRoomType === "queen"
                          ? "Queen Sized Room"
                          : "Dormitory"
                      } Images`
                    : "Hover over room types to see images"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {(hoveredRoomType
                  ? roomImages[hoveredRoomType]
                  : roomImages.default
                ).map((image, idx) => (
                  <motion.div
                    key={`${hoveredRoomType || "default"}-${idx}`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.4, delay: idx * 0.1 }}
                    whileHover={{ scale: 1.05, y: -10 }}
                    className="relative overflow-hidden rounded-2xl group"
                  >
                    <img
                      src={image}
                      alt={`${hoveredRoomType || "Room"} ${idx + 1}`}
                      className="w-full h-48 object-cover transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

                    {/* Image overlay with room type label */}
                    <div className="absolute bottom-3 left-3 right-3">
                      <div
                        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium transition-all duration-300 ${
                          hoveredRoomType === "king"
                            ? "bg-blue-500/80 text-white"
                            : hoveredRoomType === "queen"
                            ? "bg-green-500/80 text-white"
                            : hoveredRoomType === "dormitory"
                            ? "bg-purple-500/80 text-white"
                            : "bg-white/20 text-white/80"
                        }`}
                      >
                        {hoveredRoomType === "king" && (
                          <Bed className="w-3 h-3" />
                        )}
                        {hoveredRoomType === "queen" && (
                          <Bed className="w-3 h-3" />
                        )}
                        {hoveredRoomType === "dormitory" && (
                          <Users className="w-3 h-3" />
                        )}
                        <span>
                          {hoveredRoomType === "king"
                            ? "King Room"
                            : hoveredRoomType === "queen"
                            ? "Queen Room"
                            : hoveredRoomType === "dormitory"
                            ? "Dormitory"
                            : "Our Rooms"}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Hover instruction */}
              {!hoveredRoomType && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <div className="bg-black/60 backdrop-blur-sm rounded-2xl px-6 py-4 text-center">
                    <p className="text-white text-lg font-semibold mb-2">
                      Interactive Room Gallery
                    </p>
                    <p className="text-white/80 text-sm">
                      Hover over room types on the left to see specific room
                      images
                    </p>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Comprehensive Yoga Section with Parallax */}
      <section className="relative py-32 overflow-hidden">
        {/* Parallax Background */}
        <motion.div
          style={{
            y: useTransform(scrollYProgress, [0.4, 0.8], ["0%", "-30%"]),
          }}
          className="absolute inset-0 z-0"
        >
          <div
            className="w-full h-[130%] bg-cover bg-center bg-fixed"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')`,
            }}
          />
        </motion.div>

        <div className="absolute inset-0 bg-gradient-to-r from-orange-900/70 via-pink-900/70 to-purple-900/70 z-10" />

        <div className="relative z-20 container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center text-white mb-20"
          >
            <h2 className="text-6xl md:text-7xl font-extralight mb-6">
              Yoga &{" "}
              <span className="bg-gradient-to-r from-orange-400 to-pink-400 bg-clip-text text-transparent">
                Wellness
              </span>
            </h2>
            <p className="text-2xl md:text-3xl opacity-90 max-w-4xl mx-auto leading-relaxed">
              Transform your body, mind, and soul with authentic yoga practices
              in the birthplace of Ayurveda
            </p>
          </motion.div>

          {/* Enhanced Yoga & Wellness Section */}
          <div className="max-w-6xl mx-auto">
            {/* Main Hero Card */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 md:p-12 mb-12 text-center"
            >
              <div className="mb-8">
                <div className="w-24 h-24 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Activity className="w-12 h-12 text-orange-400" />
                </div>
                <h3 className="text-4xl md:text-5xl font-bold text-white mb-4">
                  Transform Your Life Through Yoga
                </h3>
                <p className="text-xl md:text-2xl text-white/80 leading-relaxed max-w-4xl mx-auto">
                  Experience authentic yoga practices in the birthplace of
                  Ayurveda. Our comprehensive programs blend traditional wisdom
                  with modern teaching methods in the serene setting of Varkala
                  Beach.
                </p>
              </div>

              {/* Key Statistics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white/10 rounded-xl p-4">
                  <div className="text-3xl font-bold text-orange-400 mb-1">
                    200+
                  </div>
                  <div className="text-white/70 text-sm">Students Trained</div>
                </div>
                <div className="bg-white/10 rounded-xl p-4">
                  <div className="text-3xl font-bold text-pink-400 mb-1">
                    15+
                  </div>
                  <div className="text-white/70 text-sm">Years Experience</div>
                </div>
                <div className="bg-white/10 rounded-xl p-4">
                  <div className="text-3xl font-bold text-blue-400 mb-1">
                    5+
                  </div>
                  <div className="text-white/70 text-sm">Expert Teachers</div>
                </div>
                <div className="bg-white/10 rounded-xl p-4">
                  <div className="text-3xl font-bold text-green-400 mb-1">
                    24/7
                  </div>
                  <div className="text-white/70 text-sm">Support</div>
                </div>
              </div>
            </motion.div>

            {/* Why Choose Us */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 mb-12"
            >
              <h4 className="text-2xl font-bold text-white text-center mb-8">
                Benefits of Yoga at Kshetra
              </h4>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-orange-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Activity className="w-8 h-8 text-orange-400" />
                  </div>
                  <h5 className="text-white font-semibold mb-2">
                    Physical Wellness
                  </h5>
                  <p className="text-white/70 text-sm">
                    Improve flexibility, strength, posture, and overall physical
                    health through guided practice
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Heart className="w-8 h-8 text-blue-400" />
                  </div>
                  <h5 className="text-white font-semibold mb-2">
                    Mental Clarity
                  </h5>
                  <p className="text-white/70 text-sm">
                    Reduce stress, enhance focus, and achieve mental peace
                    through meditation and mindfulness
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-green-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-8 h-8 text-green-400" />
                  </div>
                  <h5 className="text-white font-semibold mb-2">
                    Spiritual Growth
                  </h5>
                  <p className="text-white/70 text-sm">
                    Connect with your inner self and discover deeper meaning
                    through ancient wisdom and practices
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Call to Action */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push("/yoga")}
                className="group bg-gradient-to-r from-orange-600 to-pink-600 hover:from-orange-700 hover:to-pink-700 text-white py-6 px-12 rounded-2xl text-2xl font-bold shadow-2xl flex items-center justify-center gap-4 mx-auto transition-all duration-300"
              >
                <Activity className="w-8 h-8" />
                Explore Yoga Programs
                <ArrowRight className="w-8 h-8 group-hover:translate-x-2 transition-transform" />
              </motion.button>

              <p className="text-white/60 text-sm mt-4">
                Discover all our yoga offerings, schedules, and book your
                perfect session
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Resort Food & Dining Section */}
      <section className="relative py-32 overflow-hidden">
        {/* Parallax Background */}
        <motion.div
          style={{ y: useTransform(scrollYProgress, [0.6, 1], ["0%", "-25%"]) }}
          className="absolute inset-0 z-0"
        >
          <div
            className="w-full h-[125%] bg-cover bg-center bg-fixed"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')`,
            }}
          />
        </motion.div>

        <div className="absolute inset-0 bg-gradient-to-r from-green-900/80 via-yellow-900/80 to-orange-900/80 z-10" />

        <div className="relative z-20 container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center text-white mb-20"
          >
            <h2 className="text-6xl md:text-7xl font-extralight mb-6">
              Culinary{" "}
              <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                Experience
              </span>
            </h2>
            <p className="text-2xl md:text-3xl opacity-90 max-w-4xl mx-auto leading-relaxed">
              Savor authentic Kerala cuisine prepared with organic ingredients
              and traditional recipes
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Food Details */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8">
                <h3 className="text-4xl font-bold text-white mb-8 flex items-center gap-3">
                  <Utensils className="w-10 h-10 text-yellow-400" />
                  Our Restaurant
                </h3>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-xl font-semibold text-yellow-300 mb-3">
                      Traditional Kerala Cuisine
                    </h4>
                    {[
                      "Fish Curry & Rice - ₹350",
                      "Appam & Stew - ₹280",
                      "Kerala Breakfast - ₹250",
                      "Thali Meals - ₹320",
                    ].map((dish, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: idx * 0.1 }}
                        className="flex items-center gap-3 text-white/90"
                      >
                        <CheckCircle2 className="w-4 h-4 text-yellow-400" />
                        <span className="text-sm">{dish}</span>
                      </motion.div>
                    ))}
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-xl font-semibold text-orange-300 mb-3">
                      International Menu
                    </h4>
                    {[
                      "Continental Breakfast - ₹450",
                      "Italian Pasta - ₹380",
                      "Healthy Salads - ₹250",
                      "Fresh Juices - ₹120",
                    ].map((dish, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: idx * 0.1 }}
                        className="flex items-center gap-3 text-white/90"
                      >
                        <CheckCircle2 className="w-4 h-4 text-orange-400" />
                        <span className="text-sm">{dish}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div className="mt-8 p-6 bg-white/10 rounded-2xl">
                  <h4 className="text-2xl font-bold text-white mb-4">
                    Special Dining Experiences
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 p-4 rounded-xl">
                      <h5 className="font-semibold text-yellow-300 mb-2">
                        Sunset Beach Dinner
                      </h5>
                      <p className="text-white/80 text-sm mb-2">
                        Romantic candlelight dining by the beach
                      </p>
                      <p className="text-yellow-300 font-bold">
                        ₹2,500 per couple
                      </p>
                    </div>
                    <div className="bg-gradient-to-r from-green-600/20 to-teal-600/20 p-4 rounded-xl">
                      <h5 className="font-semibold text-green-300 mb-2">
                        Cooking Classes
                      </h5>
                      <p className="text-white/80 text-sm mb-2">
                        Learn traditional Kerala recipes
                      </p>
                      <p className="text-green-300 font-bold">
                        ₹1,800 per person
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/services')}
                className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white py-6 px-8 rounded-2xl text-xl font-bold shadow-2xl flex items-center justify-center gap-3 group"
              >
                <Utensils className="w-6 h-6" />
                Explore Dining Options
                <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
              </motion.button> */}
            </motion.div>

            {/* Food Images */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="grid grid-cols-2 gap-4">
                {[
                  "https://images.unsplash.com/photo-1596797038530-2c107229654b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                  "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                  "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                ].map((image, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: idx * 0.1 }}
                    whileHover={{ scale: 1.05, y: -10 }}
                    className="relative overflow-hidden rounded-2xl"
                  >
                    <img
                      src={image}
                      alt={`Food ${idx + 1}`}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Resort Amenities Section */}
      <section className="py-32 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center text-white mb-20"
          >
            <h2 className="text-6xl md:text-7xl font-extralight mb-6">
              Resort{" "}
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Amenities
              </span>
            </h2>
            <p className="text-2xl opacity-90 max-w-3xl mx-auto">
              Everything you need for a perfect retreat experience
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Wifi,
                title: "High-Speed WiFi",
                desc: "Stay connected throughout your stay",
              },
              {
                icon: CarIcon,
                title: "Free Parking",
                desc: "Secure parking for all guests",
              },
              {
                icon: Coffee,
                title: "24/7 Room Service",
                desc: "Round-the-clock dining service",
              },
              {
                icon: Flower2,
                title: "Spa & Wellness",
                desc: "Rejuvenate with Ayurvedic treatments",
              },
              {
                icon: Activity,
                title: "Yoga Shala",
                desc: "Dedicated yoga and meditation space",
              },
              {
                icon: Mountain,
                title: "Beach Access",
                desc: "Direct access to Varkala Beach",
              },
              {
                icon: Shield,
                title: "24/7 Security",
                desc: "Safe and secure environment",
              },
              {
                icon: Phone,
                title: "Concierge Service",
                desc: "Personal assistance for all needs",
              },
            ].map((amenity, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                whileHover={{ y: -10 }}
                className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 text-center text-white hover:bg-white/20 transition-all duration-300"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <amenity.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{amenity.title}</h3>
                <p className="text-white/80 text-sm">{amenity.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
