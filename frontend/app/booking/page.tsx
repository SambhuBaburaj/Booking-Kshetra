"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Calendar,
  Users,
  CreditCard,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  Camera,
  Car,
  Clock,
  Heart,
  Star,
  Zap,
} from "lucide-react";
import Header from "../../components/Header";
import { apiClient } from "../../lib/api-client";
import { bookingAPI } from "../../lib/api";
import PaymentButton from "../../components/PaymentButton";
import LoadingSpinner from "../../components/LoadingSpinner";
import ErrorMessage from "../../components/ErrorMessage";

interface Room {
  _id: string;
  roomNumber: string;
  roomType: "AC" | "Non-AC";
  pricePerNight: number;
  capacity: number;
  amenities: string[];
  description?: string;
  images: string[];
}

interface Guest {
  name: string;
  age: number;
  gender: "Male" | "Female" | "Other";
  idType: "Aadhaar" | "Passport" | "Driving License" | "PAN Card";
  idNumber: string;
  email?: string;
  phone?: string;
}

interface BookingData {
  // Step 1: Room & Dates
  roomId: string;
  checkIn: Date | null;
  checkOut: Date | null;

  // Step 2: Guest Details
  primaryGuest: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    emergencyContact: {
      name: string;
      phone: string;
      relationship: string;
    };
  };
  guests: Guest[];

  // Step 3: Services & Preferences
  services: {
    includeFood: boolean;
    includeBreakfast: boolean;
    transport: {
      pickup: boolean;
      drop: boolean;
      flightNumber?: string;
      arrivalTime?: string;
      departureTime?: string;
      airportLocation: "Kochi" | "Trivandrum";
    };
    additionalServices: string[];
  };

  specialRequests: string;
}

export default function BookingPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [totalAmount, setTotalAmount] = useState(0);
  const [priceBreakdown, setPriceBreakdown] = useState<{
    nights: number;
    baseAmount: number;
    foodAmount: number;
    breakfastAmount: number;
    transportAmount: number;
    total: number;
  }>({
    nights: 0,
    baseAmount: 0,
    foodAmount: 0,
    breakfastAmount: 0,
    transportAmount: 0,
    total: 0,
  });

  const [bookingData, setBookingData] = useState<BookingData>(() => ({
    roomId: "",
    checkIn: null,
    checkOut: null,
    primaryGuest: {
      name: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      pincode: "",
      emergencyContact: {
        name: "",
        phone: "",
        relationship: "",
      },
    },
    guests: [],
    services: {
      includeFood: false,
      includeBreakfast: false,
      transport: {
        pickup: false,
        drop: false,
        airportLocation: "Kochi",
      },
      additionalServices: [],
    },
    specialRequests: "",
  }));

  // Initialize from URL params
  useEffect(() => {
    const checkIn = searchParams.get("checkIn");
    const checkOut = searchParams.get("checkOut");
    const adults = searchParams.get("adults");
    const children = searchParams.get("children");

    if (checkIn && checkOut) {
      const checkInDate = new Date(checkIn);
      const checkOutDate = new Date(checkOut);

      setBookingData((prev) => ({
        ...prev,
        checkIn: checkInDate,
        checkOut: checkOutDate,
      }));

      // Initialize guests array
      const totalGuests = parseInt(adults || "1") + parseInt(children || "0");
      const guestArray: Guest[] = [];

      for (let i = 0; i < totalGuests; i++) {
        guestArray.push({
          name: "",
          age: i < parseInt(adults || "1") ? 25 : 8,
          gender: "Male",
          idType: "Aadhaar",
          idNumber: "",
          email: i === 0 ? "" : undefined,
          phone: i === 0 ? "" : undefined,
        });
      }

      setBookingData((prev) => ({
        ...prev,
        guests: guestArray,
      }));

      fetchAvailableRooms(checkInDate, checkOutDate, totalGuests);
    }
  }, [searchParams]);

  const fetchAvailableRooms = async (
    checkIn: Date,
    checkOut: Date,
    capacity: number
  ) => {
    setLoading(true);
    try {
      const response = await apiClient.get(
        `/rooms/availability?checkIn=${checkIn.toISOString()}&checkOut=${checkOut.toISOString()}&capacity=${capacity}`
      );

      if (response.success) {
        setAvailableRooms((response.data as any).availableRooms);
      } else {
        setError(response.error || "Failed to fetch available rooms");
      }
    } catch (err) {
      setError("Failed to fetch available rooms");
    } finally {
      setLoading(false);
    }
  };

  const calculatePricing = () => {
    if (!selectedRoom || !bookingData.checkIn || !bookingData.checkOut) {
      setPriceBreakdown({
        nights: 0,
        baseAmount: 0,
        foodAmount: 0,
        breakfastAmount: 0,
        transportAmount: 0,
        total: 0,
      });
      setTotalAmount(0);
      return;
    }

    const nights = Math.ceil(
      (bookingData.checkOut.getTime() - bookingData.checkIn.getTime()) /
        (1000 * 60 * 60 * 24)
    );
    const adults = bookingData.guests.filter((g) => g.age >= 5).length;

    const baseAmount = selectedRoom.pricePerNight * nights;
    let foodAmount = 0;
    let breakfastAmount = 0;
    let transportAmount = 0;

    // Food charges
    if (bookingData.services.includeFood) {
      foodAmount = adults * nights * 150;
    }

    // Breakfast charges
    if (bookingData.services.includeBreakfast) {
      breakfastAmount = adults * nights * 200;
    }

    // Transport charges
    if (bookingData.services.transport.pickup) transportAmount += 1500;
    if (bookingData.services.transport.drop) transportAmount += 1500;

    const total = baseAmount + foodAmount + breakfastAmount + transportAmount;

    setPriceBreakdown({
      nights,
      baseAmount,
      foodAmount,
      breakfastAmount,
      transportAmount,
      total,
    });
    setTotalAmount(total);
  };

  useEffect(() => {
    calculatePricing();
  }, [selectedRoom, bookingData]);

  const nextStep = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentStep(prev => Math.min(5, prev + 1));
      setIsTransitioning(false);
    }, 400);
  };

  const prevStep = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentStep(prev => Math.max(1, prev - 1));
      setIsTransitioning(false);
    }, 400);
  };

  const goToStep = (step: number) => {
    if (isTransitioning || step === currentStep) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentStep(step);
      setIsTransitioning(false);
    }, 400);
  };

  const createBooking = async () => {
    setLoading(true);
    try {
      const bookingPayload = {
        roomId: bookingData.roomId,
        checkIn: bookingData.checkIn,
        checkOut: bookingData.checkOut,
        guests: bookingData.guests.map((guest) => ({
          name: guest.name,
          age: guest.age,
          isChild: guest.age < 5,
          gender: guest.gender,
          idType: guest.idType,
          idNumber: guest.idNumber,
        })),
        primaryGuestInfo: bookingData.primaryGuest,
        includeFood: bookingData.services.includeFood,
        includeBreakfast: bookingData.services.includeBreakfast,
        transport: bookingData.services.transport,
        specialRequests: bookingData.specialRequests,
      };

      const response = await bookingAPI.createPublicBooking(bookingPayload);

      if (response.data.success) {
        setBookingId(response.data.data.booking._id);
        setCurrentStep(4); // Payment step
      } else {
        setError(response.data.message || "Failed to create booking");
      }
    } catch (err) {
      setError("Failed to create booking");
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = (paymentData: any) => {
    setCurrentStep(5); // Success step
  };

  const handlePaymentError = (error: any) => {
    setError(error.message || "Payment failed");
  };

  // Enhanced animations
  const pageTransition = {
    enter: {
      opacity: 0,
      x: 300,
      scale: 0.9
    },
    center: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: {
        duration: 0.7,
        ease: "easeOut" as any,
        staggerChildren: 0.1
      }
    },
    exit: {
      opacity: 0,
      x: -300,
      scale: 0.9,
      transition: {
        duration: 0.5,
        ease: "easeIn" as any
      }
    }
  };

  const stepVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.5, ease: "easeOut" as any }
    },
    hover: {
      scale: 1.02,
      y: -4,
      transition: { duration: 0.3, ease: "easeOut" as any }
    },
    tap: { scale: 0.98 }
  };


  // Step 1: Room Selection
  const RoomSelectionStep = () => (
    <motion.div
      variants={stepVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="space-y-8"
    >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="text-center mb-12"
      >
        <div className="inline-flex items-center gap-1.5 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full mb-4 border border-blue-200/60 shadow-sm">
          <div className="w-1.5 h-1.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
          <span className="text-xs font-bold text-blue-700 tracking-wider">STEP 1 OF 3</span>
        </div>
        <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-4">
          Choose Your Perfect Room
        </h2>
        <div className="text-sm sm:text-base lg:text-lg text-gray-600 max-w-2xl mx-auto">
          {bookingData.checkIn && bookingData.checkOut && (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
              <span className="inline-flex items-center gap-2 bg-white px-3 sm:px-4 py-2 rounded-full shadow-sm border text-sm">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span className="whitespace-nowrap">
                  {bookingData.checkIn.toLocaleDateString()} - {bookingData.checkOut.toLocaleDateString()}
                </span>
              </span>
              <span className="hidden sm:inline">•</span>
              <span className="inline-flex items-center gap-2 bg-white px-3 sm:px-4 py-2 rounded-full shadow-sm border text-sm">
                <Users className="w-4 h-4 text-blue-600" />
                {bookingData.guests.length} guests
              </span>
            </div>
          )}
        </div>
      </motion.div>

      {loading && <LoadingSpinner text="Finding available rooms..." />}

      {error && (
        <ErrorMessage message={error} onDismiss={() => setError(null)} />
      )}

      <div className="grid gap-8">
        {availableRooms.map((room, index) => (
          <motion.div
            key={room._id}
            variants={stepVariants}
            initial="hidden"
            animate="visible"
            whileHover="hover"
            whileTap="tap"
            transition={{ delay: index * 0.1 }}
            className={`group relative bg-white rounded-2xl overflow-hidden cursor-pointer transition-all duration-500 ${
              selectedRoom?._id === room._id
                ? "shadow-2xl ring-4 ring-blue-500/20 bg-gradient-to-br from-blue-50 via-white to-purple-50"
                : "shadow-lg hover:shadow-2xl border border-gray-100"
            }`}
            onClick={() => {
              setSelectedRoom(room);
              setBookingData((prev) => ({ ...prev, roomId: room._id }));
            }}
          >
            <div className={`absolute inset-0 bg-gradient-to-r opacity-0 transition-opacity duration-300 ${
              selectedRoom?._id === room._id ? "opacity-10" : "group-hover:opacity-5"
            } from-blue-600 to-purple-600`} />

            <div className="relative p-4 sm:p-6 lg:p-8">
              <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6 lg:gap-8">
                <div className="relative flex-shrink-0 w-full sm:w-auto">
                  <div className="w-full h-48 sm:w-24 sm:h-24 lg:w-32 lg:h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl overflow-hidden shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                    {room.images.length > 0 ? (
                      <img
                        src={room.images[0]}
                        alt={`Room ${room.roomNumber}`}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100">
                        <Camera className="w-10 h-10 text-blue-400" />
                      </div>
                    )}
                  </div>
                  {selectedRoom?._id === room._id && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-2 -right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shadow-lg"
                    >
                      <CheckCircle className="w-5 h-5 text-white" />
                    </motion.div>
                  )}
                </div>

                <div className="flex-1 w-full">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                        <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                          Room {room.roomNumber}
                        </h3>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                        <span className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors ${
                          room.roomType === 'AC'
                            ? 'bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 border border-blue-200'
                            : 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200'
                        }`}>
                          {room.roomType}
                        </span>
                        <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-full">
                          <Users className="w-4 h-4 text-gray-600" />
                          <span className="text-sm font-medium text-gray-700">
                            Up to {room.capacity} guests
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="w-full sm:w-auto sm:text-right">
                      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-300">
                        <div className="text-xl sm:text-2xl lg:text-3xl font-bold">
                          ₹{room.pricePerNight.toLocaleString()}
                        </div>
                        <div className="text-sm opacity-90 font-medium">per night</div>
                        <div className="text-xs opacity-75 mt-1">+ taxes</div>
                      </div>
                    </div>
                  </div>

                  {room.amenities.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {room.amenities.slice(0, 8).map((amenity, index) => (
                        <motion.span
                          key={index}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.05 }}
                          className="px-3 py-1.5 bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 text-xs font-medium rounded-full border hover:from-blue-50 hover:to-blue-100 hover:text-blue-700 transition-all duration-200 cursor-default"
                        >
                          {amenity}
                        </motion.span>
                      ))}
                      {room.amenities.length > 8 && (
                        <span className="px-3 py-1.5 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 text-xs font-medium rounded-full border border-blue-200">
                          +{room.amenities.length - 8} more
                        </span>
                      )}
                    </div>
                  )}

                  {room.description && (
                    <p className="text-gray-600 leading-relaxed">{room.description}</p>
                  )}

                  <div className="mt-6 flex items-center gap-4">
                    <div className="flex items-center gap-2 text-green-600">
                      <Heart className="w-4 h-4" />
                      <span className="text-sm font-medium">Most loved</span>
                    </div>
                    <div className="flex items-center gap-2 text-blue-600">
                      <Zap className="w-4 h-4" />
                      <span className="text-sm font-medium">Quick book</span>
                    </div>
                    <div className="flex items-center gap-2 text-purple-600">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm font-medium">24/7 service</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );

  // Step 2: Primary Guest Details
  const GuestDetailsStep = () => {
    const handlePrimaryGuestSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);

      // Update state with form data
      setBookingData((prev) => ({
        ...prev,
        primaryGuest: {
          ...prev.primaryGuest,
          name: (formData.get("name") as string) || "",
          email: (formData.get("email") as string) || "",
          phone: (formData.get("phone") as string) || "",
          address: (formData.get("address") as string) || "",
          city: (formData.get("city") as string) || "",
          state: (formData.get("state") as string) || "",
          pincode: (formData.get("pincode") as string) || "",
          emergencyContact: {
            name: (formData.get("emergencyName") as string) || "",
            phone: (formData.get("emergencyPhone") as string) || "",
            relationship:
              (formData.get("emergencyRelationship") as string) || "",
          },
        },
      }));

      nextStep();
    };

    return (
      <motion.div
        variants={stepVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="space-y-8"
      >
        <motion.div
          variants={stepVariants}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-1.5 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full mb-4 border border-green-200/60 shadow-sm">
            <div className="w-1.5 h-1.5 bg-gradient-to-r from-green-500 to-blue-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-bold text-green-700 tracking-wider">STEP 2 OF 3</span>
          </div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-4">
            Your Information
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We need your details to create the perfect stay experience
          </p>
        </motion.div>

        <motion.form
          onSubmit={handlePrimaryGuestSubmit}
          variants={stepVariants}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
            <motion.div
              variants={stepVariants}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <label
                htmlFor="name"
                className="block text-sm font-semibold text-gray-800 mb-3"
              >
                Full Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                defaultValue={bookingData.primaryGuest.name}
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 font-medium bg-gray-50 focus:bg-white"
                required
                autoComplete="name"
                placeholder="Enter your full name"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-gray-800 mb-3"
              >
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                defaultValue={bookingData.primaryGuest.email}
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 font-medium bg-gray-50 focus:bg-white"
                required
                autoComplete="email"
                placeholder="your.email@example.com"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <label
                htmlFor="phone"
                className="block text-sm font-semibold text-gray-800 mb-3"
              >
                Phone Number *
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                defaultValue={bookingData.primaryGuest.phone}
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 font-medium bg-gray-50 focus:bg-white"
                required
                autoComplete="tel"
                placeholder="+91 9876543210"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
            >
              <label
                htmlFor="address"
                className="block text-sm font-semibold text-gray-800 mb-3"
              >
                Address *
              </label>
              <input
                type="text"
                id="address"
                name="address"
                defaultValue={bookingData.primaryGuest.address}
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 font-medium bg-gray-50 focus:bg-white"
                required
                autoComplete="address-line1"
                placeholder="Your address"
              />
            </motion.div>

            <div>
              <label
                htmlFor="city"
                className="block text-sm font-semibold text-gray-800 mb-3"
              >
                City *
              </label>
              <input
                type="text"
                id="city"
                name="city"
                defaultValue={bookingData.primaryGuest.city}
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 font-medium bg-gray-50 focus:bg-white"
                required
                autoComplete="address-level2"
              />
            </div>

            <div>
              <label
                htmlFor="state"
                className="block text-sm font-semibold text-gray-800 mb-3"
              >
                State *
              </label>
              <input
                type="text"
                id="state"
                name="state"
                defaultValue={bookingData.primaryGuest.state}
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 font-medium bg-gray-50 focus:bg-white"
                required
                autoComplete="address-level1"
              />
            </div>

            <div>
              <label
                htmlFor="pincode"
                className="block text-sm font-semibold text-gray-800 mb-3"
              >
                PIN Code *
              </label>
              <input
                type="text"
                id="pincode"
                name="pincode"
                defaultValue={bookingData.primaryGuest.pincode}
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 font-medium bg-gray-50 focus:bg-white"
                required
                autoComplete="postal-code"
              />
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="mt-8 pt-6 border-t">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Emergency Contact
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label
                  htmlFor="emergencyName"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Contact Name
                </label>
                <input
                  type="text"
                  id="emergencyName"
                  name="emergencyName"
                  defaultValue={bookingData.primaryGuest.emergencyContact.name}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label
                  htmlFor="emergencyPhone"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Contact Phone
                </label>
                <input
                  type="tel"
                  id="emergencyPhone"
                  name="emergencyPhone"
                  defaultValue={bookingData.primaryGuest.emergencyContact.phone}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label
                  htmlFor="emergencyRelationship"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Relationship
                </label>
                <select
                  id="emergencyRelationship"
                  name="emergencyRelationship"
                  defaultValue={bookingData.primaryGuest.emergencyContact.relationship}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select</option>
                  <option value="spouse">Spouse</option>
                  <option value="parent">Parent</option>
                  <option value="sibling">Sibling</option>
                  <option value="friend">Friend</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="flex justify-center pt-8"
          >
            <motion.button
              type="submit"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="w-full sm:w-auto px-8 sm:px-12 py-3 sm:py-4 bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700 text-white font-bold rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-blue-500/20"
            >
              Continue to Services
              <ArrowRight className="w-5 h-5 ml-2 inline" />
            </motion.button>
          </motion.div>
        </motion.form>
      </motion.div>
    );
  };

  // Step 3: Services & Preferences
  const ServicesStep = () => {
    const handleServicesSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);

      setBookingData((prev) => ({
        ...prev,
        services: {
          ...prev.services,
          includeFood: formData.get("includeFood") === "on",
          includeBreakfast: formData.get("includeBreakfast") === "on",
          transport: {
            ...prev.services.transport,
            pickup: formData.get("pickup") === "on",
            drop: formData.get("drop") === "on",
            airportLocation:
              (formData.get("airportLocation") as "Kochi" | "Trivandrum") ||
              "Kochi",
            flightNumber: (formData.get("flightNumber") as string) || undefined,
            arrivalTime: (formData.get("arrivalTime") as string) || undefined,
            departureTime:
              (formData.get("departureTime") as string) || undefined,
          },
        },
        specialRequests: (formData.get("specialRequests") as string) || "",
      }));

      createBooking();
    };

    return (
      <motion.div
        variants={stepVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="space-y-8"
      >
        <motion.div
          variants={stepVariants}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-1.5 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full mb-4 border border-orange-200/60 shadow-sm">
            <div className="w-1.5 h-1.5 bg-gradient-to-r from-orange-500 to-red-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-bold text-orange-700 tracking-wider">STEP 3 OF 3</span>
          </div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-4">
            Customize Your Experience
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Add services to make your stay perfect
          </p>
        </motion.div>

        <motion.form
          onSubmit={handleServicesSubmit}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="space-y-8"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg p-8 border border-gray-100"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-green-100 to-green-200 rounded-xl flex items-center justify-center">
                <span className="text-2xl">🍽️</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">
                Food Services
              </h3>
            </div>
            <div className="space-y-6">
              <motion.label
                className="group flex items-start p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 hover:shadow-lg"
                animate={{
                  borderColor: bookingData.services.includeFood
                    ? "#10B981"
                    : "#E5E7EB",
                  backgroundColor: bookingData.services.includeFood
                    ? "#F0FDF4"
                    : "#FFFFFF",
                  scale: bookingData.services.includeFood ? 1.02 : 1
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <input
                  type="checkbox"
                  name="includeFood"
                  checked={bookingData.services.includeFood}
                  onChange={(e) => {
                    setBookingData((prev) => ({
                      ...prev,
                      services: {
                        ...prev.services,
                        includeFood: e.target.checked,
                      },
                    }));
                  }}
                  className="mr-4 w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-semibold text-gray-900">
                        Include Meals
                      </span>
                      <p className="text-sm text-gray-600 mt-1">
                        3 meals per day for all guests
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold text-green-600">
                        +₹150
                      </span>
                      <p className="text-xs text-gray-500">per person/day</p>
                    </div>
                  </div>
                </div>
              </motion.label>

              <motion.label
                className="group flex items-start p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 hover:shadow-lg"
                animate={{
                  borderColor: bookingData.services.includeBreakfast
                    ? "#F59E0B"
                    : "#E5E7EB",
                  backgroundColor: bookingData.services.includeBreakfast
                    ? "#FFFBEB"
                    : "#FFFFFF",
                  scale: bookingData.services.includeBreakfast ? 1.02 : 1
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <input
                  type="checkbox"
                  name="includeBreakfast"
                  checked={bookingData.services.includeBreakfast}
                  onChange={(e) => {
                    setBookingData((prev) => ({
                      ...prev,
                      services: {
                        ...prev.services,
                        includeBreakfast: e.target.checked,
                      },
                    }));
                  }}
                  className="mr-4 w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-semibold text-gray-900">
                        Breakfast Only
                      </span>
                      <p className="text-sm text-gray-600 mt-1">
                        Daily breakfast service
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold text-green-600">
                        +₹200
                      </span>
                      <p className="text-xs text-gray-500">per person/day</p>
                    </div>
                  </div>
                </div>
              </motion.label>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg p-8 border border-gray-100"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
                <Car className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">
                Transport Services
              </h3>
            </div>
            <div className="space-y-6">
              <motion.label
                className="flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:bg-gray-50"
                animate={{
                  borderColor: bookingData.services.transport.pickup
                    ? "#3B82F6"
                    : "#E5E7EB",
                  backgroundColor: bookingData.services.transport.pickup
                    ? "#EFF6FF"
                    : "#FFFFFF",
                }}
              >
                <input
                  type="checkbox"
                  name="pickup"
                  checked={bookingData.services.transport.pickup}
                  onChange={(e) => {
                    setBookingData((prev) => ({
                      ...prev,
                      services: {
                        ...prev.services,
                        transport: {
                          ...prev.services.transport,
                          pickup: e.target.checked,
                        },
                      },
                    }));
                  }}
                  className="mr-4 w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <Car className="w-5 h-5 text-blue-600" />
                      <div>
                        <span className="font-semibold text-gray-900">
                          Airport Pickup
                        </span>
                        <p className="text-sm text-gray-600 mt-1">
                          Comfortable pickup service from airport
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold text-blue-600">
                        +₹1,500
                      </span>
                      <p className="text-xs text-gray-500">one-time</p>
                    </div>
                  </div>
                </div>
              </motion.label>

              <motion.label
                className="flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:bg-gray-50"
                animate={{
                  borderColor: bookingData.services.transport.drop
                    ? "#3B82F6"
                    : "#E5E7EB",
                  backgroundColor: bookingData.services.transport.drop
                    ? "#EFF6FF"
                    : "#FFFFFF",
                }}
              >
                <input
                  type="checkbox"
                  name="drop"
                  checked={bookingData.services.transport.drop}
                  onChange={(e) => {
                    setBookingData((prev) => ({
                      ...prev,
                      services: {
                        ...prev.services,
                        transport: {
                          ...prev.services.transport,
                          drop: e.target.checked,
                        },
                      },
                    }));
                  }}
                  className="mr-4 w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <Car className="w-5 h-5 text-blue-600" />
                      <div>
                        <span className="font-semibold text-gray-900">
                          Airport Drop
                        </span>
                        <p className="text-sm text-gray-600 mt-1">
                          Safe drop service to airport
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold text-blue-600">
                        +₹1,500
                      </span>
                      <p className="text-xs text-gray-500">one-time</p>
                    </div>
                  </div>
                </div>
              </motion.label>

              {(bookingData.services.transport.pickup ||
                bookingData.services.transport.drop) && (
                <div className="pl-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Airport Location
                    </label>
                    <select
                      name="airportLocation"
                      defaultValue={bookingData.services.transport.airportLocation}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="Kochi">Kochi Airport</option>
                      <option value="Trivandrum">Trivandrum Airport</option>
                    </select>
                  </div>

                  {bookingData.services.transport.pickup && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Flight Number (for pickup)
                      </label>
                      <input
                        type="text"
                        name="flightNumber"
                        defaultValue={bookingData.services.transport.flightNumber || ""}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g. AI 674"
                      />
                    </div>
                  )}

                  {bookingData.services.transport.pickup && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Arrival Time
                      </label>
                      <input
                        type="datetime-local"
                        name="arrivalTime"
                        defaultValue={bookingData.services.transport.arrivalTime || ""}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Special Requests
            </h3>
            <textarea
              name="specialRequests"
              defaultValue={bookingData.specialRequests}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              placeholder="Any special requests or requirements..."
            />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="flex justify-center pt-8"
          >
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.05, y: loading ? 0 : -2 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              className="w-full sm:w-auto px-8 sm:px-12 lg:px-16 py-4 sm:py-5 bg-gradient-to-r from-green-600 via-green-700 to-emerald-700 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed border border-green-500/20 text-base sm:text-lg"
            >
              {loading ? (
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating Booking...
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6" />
                  Create Booking & Continue
                </div>
              )}
            </motion.button>
          </motion.div>
        </motion.form>
      </motion.div>
    );
  };


  // Step 5: Payment
  const PaymentStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Complete Payment
        </h2>
        <p className="text-gray-600">Secure payment with Razorpay</p>
      </div>

      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg p-8 border">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Payment Details</h3>
        </div>

        {selectedRoom && bookingData.checkIn && bookingData.checkOut && (
          <div className="space-y-4">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-semibold text-gray-900">
                    Room {selectedRoom.roomNumber}
                  </span>
                  <p className="text-sm text-gray-600">
                    {selectedRoom.roomType}
                  </p>
                </div>
                <span className="font-bold text-gray-900">
                  ₹{selectedRoom.pricePerNight.toLocaleString()}/night
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-gray-700">
                    Check-in
                  </span>
                </div>
                <p className="text-sm text-gray-900">
                  {bookingData.checkIn.toLocaleDateString()}
                </p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-gray-700">
                    Check-out
                  </span>
                </div>
                <p className="text-sm text-gray-900">
                  {bookingData.checkOut.toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">
                  Total Guests
                </span>
              </div>
              <p className="text-sm text-gray-900">
                {bookingData.guests.length} guests
              </p>
            </div>

            <div className="border-t pt-4">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold">Total Amount</span>
                  <span className="text-2xl font-bold">
                    ₹{totalAmount.toLocaleString()}
                  </span>
                </div>
                <p className="text-sm opacity-90 mt-1">
                  Includes all selected services
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {bookingId && (
        <div className="mt-8">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-green-800 font-medium">
                Booking Created Successfully!
              </span>
            </div>
            <p className="text-green-700 text-sm mt-1">
              Complete your payment to confirm the booking
            </p>
          </div>

          <PaymentButton
            amount={totalAmount}
            bookingId={bookingId}
            userDetails={{
              name: bookingData.primaryGuest.name,
              email: bookingData.primaryGuest.email,
              phone: bookingData.primaryGuest.phone,
            }}
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
          />
        </div>
      )}
    </div>
  );

  // Step 6: Success
  const SuccessStep = () => (
    <div className="text-center py-12">
      <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        Booking Confirmed!
      </h2>
      <p className="text-gray-600 mb-6">
        Your booking has been confirmed. A confirmation email has been sent to{" "}
        {bookingData.primaryGuest.email}.
      </p>
      <div className="text-sm text-gray-500 mb-6">
        <p>Booking ID: {bookingId}</p>
      </div>
      <button
        onClick={() => router.push("/dashboard")}
        className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
      >
        View My Bookings
      </button>
    </div>
  );

  const steps = [
    { number: 1, title: "Select Room", component: <RoomSelectionStep /> },
    { number: 2, title: "Guest Details", component: <GuestDetailsStep /> },
    { number: 3, title: "Services", component: <ServicesStep /> },
    { number: 4, title: "Payment", component: <PaymentStep /> },
    { number: 5, title: "Confirmation", component: <SuccessStep /> },
  ];

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return selectedRoom !== null;
      default:
        return true;
    }
  };

  // Price Summary Component
  const PriceSummary = () => {
    if (!selectedRoom || currentStep === 1) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="bg-gradient-to-br from-white via-blue-50 to-purple-50 rounded-2xl shadow-2xl p-4 sm:p-6 lg:p-8 lg:sticky lg:top-6 border border-blue-100 mb-6 lg:mb-0"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Booking Summary
          </h3>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center p-3 bg-white rounded-xl shadow-sm">
            <span className="font-medium text-gray-800">
              Room {selectedRoom.roomNumber}
            </span>
            <span className="font-bold text-gray-900">
              ₹{selectedRoom.pricePerNight.toLocaleString()}/night
            </span>
          </div>

          {priceBreakdown.nights > 0 && (
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-xl">
              <span className="font-medium text-blue-800">
                {priceBreakdown.nights} nights
              </span>
              <span className="font-bold text-blue-900">
                ₹{priceBreakdown.baseAmount.toLocaleString()}
              </span>
            </div>
          )}
          {priceBreakdown.foodAmount > 0 && (
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-xl">
              <span className="font-medium text-green-800 flex items-center gap-2">
                🍽️ Meals included
              </span>
              <span className="font-bold text-green-900">
                + ₹{priceBreakdown.foodAmount.toLocaleString()}
              </span>
            </div>
          )}

          {priceBreakdown.breakfastAmount > 0 && (
            <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-xl">
              <span className="font-medium text-yellow-800 flex items-center gap-2">
                ☀️ Breakfast
              </span>
              <span className="font-bold text-yellow-900">
                + ₹{priceBreakdown.breakfastAmount.toLocaleString()}
              </span>
            </div>
          )}

          {priceBreakdown.transportAmount > 0 && (
            <div className="flex justify-between items-center p-3 bg-purple-50 rounded-xl">
              <span className="font-medium text-purple-800 flex items-center gap-2">
                <Car className="w-4 h-4" />
                Airport transport
              </span>
              <span className="font-bold text-purple-900">
                + ₹{priceBreakdown.transportAmount.toLocaleString()}
              </span>
            </div>
          )}

          {bookingData.checkIn && bookingData.checkOut && (
            <div className="pt-3 border-t">
              <div className="flex justify-between">
                <span className="text-gray-600">Check-in</span>
                <span className="text-sm">
                  {bookingData.checkIn.toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Check-out</span>
                <span className="text-sm">
                  {bookingData.checkOut.toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Guests</span>
                <span className="text-sm">{bookingData.guests.length}</span>
              </div>
            </div>
          )}
        </div>

        <motion.div
          className="pt-6 mt-6 border-t-2 border-gradient-to-r from-blue-200 to-purple-200"
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 rounded-2xl text-white shadow-lg">
            <span className="text-xl font-bold">Total Amount</span>
            <span className="text-3xl font-black">
              ₹{totalAmount.toLocaleString()}
            </span>
          </div>
          <p className="text-center text-sm text-gray-600 mt-2">
            Including all taxes and charges
          </p>
        </motion.div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Main Content */}
            <div className="order-2 lg:order-1 lg:col-span-2">
              {/* Clean Tab Navigation */}
              <div className="mb-8 sm:mb-12">
                <div className="hidden sm:block">
                  <div className="flex items-center justify-center space-x-8">
                    {steps.slice(0, 3).map((step) => (
                      <motion.div
                        key={step.number}
                        className="flex flex-col items-center cursor-pointer group"
                        onClick={() => step.number <= currentStep && goToStep(step.number)}
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: step.number * 0.1 }}
                      >
                        {/* Step Circle */}
                        <motion.div
                          className={`w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold border-4 transition-all duration-300 ${
                            currentStep === step.number
                              ? "bg-gradient-to-br from-blue-500 to-purple-600 text-white border-blue-200 shadow-lg shadow-blue-200/50"
                              : currentStep > step.number
                              ? "bg-gradient-to-br from-green-400 to-emerald-500 text-white border-green-200 shadow-md"
                              : "bg-white text-gray-400 border-gray-300 group-hover:border-gray-400"
                          }`}
                          animate={{
                            scale: currentStep === step.number ? [1, 1.05, 1] : 1,
                          }}
                          transition={{
                            duration: 2,
                            repeat: currentStep === step.number ? Infinity : 0,
                            ease: "easeInOut"
                          }}
                        >
                          {currentStep > step.number ? (
                            <CheckCircle className="w-7 h-7" />
                          ) : (
                            <span>{step.number}</span>
                          )}
                        </motion.div>

                        {/* Step Title */}
                        <motion.div
                          className="mt-3 text-center"
                          animate={{
                            y: currentStep === step.number ? [0, -2, 0] : 0,
                          }}
                          transition={{
                            duration: 2,
                            repeat: currentStep === step.number ? Infinity : 0,
                            ease: "easeInOut"
                          }}
                        >
                          <h3
                            className={`text-sm font-semibold transition-colors duration-300 ${
                              currentStep === step.number
                                ? "text-blue-600"
                                : currentStep > step.number
                                ? "text-green-600"
                                : "text-gray-500 group-hover:text-gray-700"
                            }`}
                          >
                            {step.title}
                          </h3>
                          <div
                            className={`mt-1 h-0.5 w-full rounded transition-all duration-300 ${
                              currentStep >= step.number
                                ? "bg-gradient-to-r from-blue-400 to-purple-500"
                                : "bg-gray-200"
                            }`}
                          />
                        </motion.div>

                        {/* Connecting Line */}
                        {step.number < 3 && (
                          <div className="absolute top-7 left-full w-8 h-0.5 bg-gray-200 transform -translate-y-1/2">
                            <motion.div
                              className="h-full bg-gradient-to-r from-blue-400 to-purple-500 origin-left"
                              initial={{ scaleX: 0 }}
                              animate={{ scaleX: currentStep > step.number ? 1 : 0 }}
                              transition={{ duration: 0.5, ease: "easeInOut" }}
                            />
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
                {/* Mobile Progress Bar */}
                <motion.div
                  className="sm:hidden mb-4"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="flex items-center justify-center space-x-2 mb-3">
                    <motion.span
                      className="text-sm font-medium text-blue-600"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 2 }}
                    >
                      Step {currentStep} of 3
                    </motion.span>
                  </div>
                  <div className="bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
                    <motion.div
                      className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 h-3 rounded-full shadow-lg"
                      animate={{
                        width: `${(currentStep / 3) * 100}%`,
                        backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
                      }}
                      transition={{
                        width: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] },
                        backgroundPosition: { duration: 3, repeat: Infinity, ease: "linear" }
                      }}
                    />
                  </div>
                  {/* Step dots */}
                  <div className="flex justify-center mt-3 space-x-2">
                    {[1, 2, 3].map((step) => (
                      <motion.div
                        key={step}
                        className={`w-2 h-2 rounded-full transition-colors duration-500 ${
                          currentStep >= step ? 'bg-blue-500' : 'bg-gray-300'
                        }`}
                        animate={{
                          scale: currentStep === step ? [1, 1.5, 1] : 1
                        }}
                        transition={{ duration: 0.6, repeat: currentStep === step ? Infinity : 0, repeatDelay: 1 }}
                      />
                    ))}
                  </div>
                </motion.div>
              </div>

              {error && (
                <ErrorMessage
                  message={error}
                  onDismiss={() => setError(null)}
                  className="mb-6"
                />
              )}

              {/* Step Content */}
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={currentStep}
                  variants={pageTransition}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="mb-8"
                >
                  {steps[currentStep - 1]?.component}
                </motion.div>
              </AnimatePresence>

              {/* Navigation Buttons */}
              {currentStep < 5 && currentStep === 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                  className="flex justify-between items-center"
                >
                  <motion.button
                    type="button"
                    onClick={prevStep}
                    disabled={currentStep === 1 || isTransitioning}
                    whileHover={{ scale: currentStep === 1 ? 1 : 1.05 }}
                    whileTap={{ scale: currentStep === 1 ? 1 : 0.95 }}
                    className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4 text-gray-500 hover:text-gray-700 flex items-center justify-center gap-2 disabled:opacity-30 transition-all duration-200 font-medium rounded-xl hover:bg-gray-50"
                  >
                    <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="hidden sm:inline">Previous</span>
                  </motion.button>

                  <motion.button
                    type="button"
                    onClick={() => nextStep()}
                    disabled={!canProceed() || loading || isTransitioning}
                    whileHover={{ scale: (!canProceed() || loading) ? 1 : 1.05, y: (!canProceed() || loading) ? 0 : -2 }}
                    whileTap={{ scale: (!canProceed() || loading) ? 1 : 0.98 }}
                    className="px-6 sm:px-8 lg:px-12 py-3 sm:py-4 bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700 text-white font-bold rounded-2xl shadow-lg hover:shadow-2xl flex items-center justify-center gap-2 sm:gap-3 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 border border-blue-500/20"
                  >
                    {isTransitioning ? (
                      <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <span className="text-sm sm:text-base">Continue</span>
                        <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                      </>
                    )}
                  </motion.button>
                </motion.div>
              )}

              {/* Payment Navigation */}
              {currentStep === 4 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                  className="flex justify-start"
                >
                  <motion.button
                    type="button"
                    onClick={prevStep}
                    disabled={isTransitioning}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4 text-gray-600 hover:text-gray-800 flex items-center gap-2 transition-all duration-200 font-medium rounded-xl hover:bg-gray-50"
                  >
                    <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="text-sm sm:text-base">Back to Services</span>
                  </motion.button>
                </motion.div>
              )}
            </div>

            {/* Price Summary Sidebar */}
            <div className="order-1 lg:order-2 lg:col-span-1">
              <PriceSummary />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}