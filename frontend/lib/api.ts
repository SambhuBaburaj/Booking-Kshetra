import axios from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5001/api";

// Create axios instance
const ApiInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: false,
});

// Request interceptor for auth token
ApiInstance.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
ApiInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/admin/login";
      }
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  login: async (data: { email: string; password: string }) => {
    return await ApiInstance.post("/auth/login", data);
  },

  register: async (data: {
    name: string;
    email: string;
    phone: string;
    password: string;
  }) => {
    return await ApiInstance.post("/auth/register", data);
  },

  logout: async () => {
    return await ApiInstance.post("/auth/logout");
  },

  getProfile: async () => {
    return await ApiInstance.get("/auth/profile");
  },

  updateProfile: async (data: any) => {
    return await ApiInstance.put("/auth/profile", data);
  },
};

// Room API calls
export const roomAPI = {
  getAllRooms: async (params?: any) => {
    return await ApiInstance.get("/rooms", { params });
  },

  getRoomById: async (id: string) => {
    return await ApiInstance.get(`/rooms/${id}`);
  },

  checkAvailability: async (data: {
    checkIn: string;
    checkOut: string;
    roomType?: string;
  }) => {
    return await ApiInstance.post("/rooms/check-availability", data);
  },
};

// Booking API calls
export const bookingAPI = {
  // Public booking (no auth required)
  createPublicBooking: async (data: any) => {
    return await ApiInstance.post("/bookings/public", data);
  },

  // Public booking details (no auth required)
  getPublicBookingById: async (id: string) => {
    return await ApiInstance.get(`/bookings/public/${id}`);
  },

  // Authenticated booking
  createBooking: async (data: any) => {
    return await ApiInstance.post("/bookings", data);
  },

  getUserBookings: async (params?: any) => {
    return await ApiInstance.get("/bookings/user", { params });
  },

  getBookingById: async (id: string) => {
    return await ApiInstance.get(`/bookings/${id}`);
  },

  cancelBooking: async (id: string) => {
    return await ApiInstance.patch(`/bookings/${id}/cancel`);
  },
};

// Payment API calls
export const paymentAPI = {
  createOrder: async (data: { amount: number; bookingId: string }) => {
    return await ApiInstance.post("/payments/public/create-order", data);
  },

  verifyPayment: async (data: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    bookingId: string;
  }) => {
    return await ApiInstance.post("/payments/public/verify", data);
  },
};

// Service API calls
export const serviceAPI = {
  getAllServices: async (params?: any) => {
    return await ApiInstance.get("/services", { params });
  },

  getServiceById: async (id: string) => {
    return await ApiInstance.get(`/services/${id}`);
  },
};

// Yoga API calls
export const yogaAPI = {
  getAllSessions: async (params?: any) => {
    return await ApiInstance.get("/yoga", { params });
  },

  getSessionById: async (id: string) => {
    return await ApiInstance.get(`/yoga/${id}`);
  },

  bookSession: async (data: { sessionId: string; participants: number }) => {
    return await ApiInstance.post("/yoga/book", data);
  },
};

// Notification API calls
export const notificationAPI = {
  sendBookingConfirmation: async (bookingId: string) => {
    return await ApiInstance.post("/notifications/booking-confirmation", {
      bookingId,
    });
  },

  sendWhatsApp: async (data: { phone: string; message: string }) => {
    return await ApiInstance.post("/notifications/whatsapp", data);
  },

  sendEmail: async (data: { email: string; subject: string; html: string }) => {
    return await ApiInstance.post("/notifications/email", data);
  },
};

// Admin API calls
export const adminAPI = {
  // Dashboard
  getDashboard: async () => {
    return await ApiInstance.get("/admin/dashboard");
  },

  // Room Management
  getAllRooms: async (params?: any) => {
    return await ApiInstance.get("/admin/rooms", { params });
  },

  createRoom: async (data: FormData) => {
    return await ApiInstance.post("/admin/rooms", data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  updateRoom: async (id: string, data: FormData) => {
    return await ApiInstance.put(`/admin/rooms/${id}`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  deleteRoom: async (id: string) => {
    return await ApiInstance.delete(`/admin/rooms/${id}`);
  },

  getRoomAvailability: async (params?: any) => {
    return await ApiInstance.get("/admin/rooms/availability", { params });
  },

  bulkUpdateAvailability: async (data: any) => {
    return await ApiInstance.patch("/admin/rooms/bulk-availability", data);
  },

  // Booking Management
  getAllBookings: async (params?: any) => {
    return await ApiInstance.get("/admin/bookings", { params });
  },

  createBooking: async (data: any) => {
    return await ApiInstance.post("/admin/bookings", data);
  },

  updateBookingStatus: async (id: string, data: { status: string }) => {
    return await ApiInstance.put(`/admin/bookings/${id}/status`, data);
  },

  // User Management
  getAllUsers: async (params?: any) => {
    return await ApiInstance.get("/admin/users", { params });
  },

  updateUserStatus: async (id: string, data: { isActive: boolean }) => {
    return await ApiInstance.patch(`/admin/users/${id}/status`, data);
  },

  // Service Management
  getAllServices: async (params?: any) => {
    return await ApiInstance.get("/admin/services", { params });
  },

  createService: async (data: any) => {
    return await ApiInstance.post("/admin/services", data);
  },

  updateService: async (id: string, data: any) => {
    return await ApiInstance.put(`/admin/services/${id}`, data);
  },

  deleteService: async (id: string) => {
    return await ApiInstance.delete(`/admin/services/${id}`);
  },

  // Yoga Session Management
  getAllYogaSessions: async (params?: any) => {
    return await ApiInstance.get("/admin/yoga", { params });
  },

  createYogaSession: async (data: any) => {
    return await ApiInstance.post("/admin/yoga", data);
  },

  updateYogaSession: async (id: string, data: any) => {
    return await ApiInstance.put(`/admin/yoga/${id}`, data);
  },

  deleteYogaSession: async (id: string) => {
    return await ApiInstance.delete(`/admin/yoga/${id}`);
  },
};

// Contact API calls
export const contactAPI = {
  sendMessage: async (data: {
    name: string;
    email: string;
    phone?: string;
    subject: string;
    message: string;
  }) => {
    return await ApiInstance.post("/contact", data);
  },
};

// Service pricing constants
export const SERVICE_PRICES = {
  TRANSPORT: {
    PICKUP: 1500,
    DROP: 1500,
  },
  BREAKFAST: 200, // per person per day
  FOOD: 150, // per adult per day (included in room booking)
  BIKE_RENTAL: 500, // per bike per day
  SIGHTSEEING: 1500, // per person
  SURFING: 2000, // per person
  YOGA: {
    "200hr": 15000,
    "300hr": 20000,
  },
} as const;

// Export the main instance for custom calls
export default ApiInstance;
