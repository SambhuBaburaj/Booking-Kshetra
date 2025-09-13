# Resort Booking System

A comprehensive resort booking system built with Node.js, Express, MongoDB, React, and Next.js. This system handles room bookings, user management, payment processing, and admin operations for Kshetra Retreat Resort.

## Features

### Backend Features
- **User Authentication**: JWT-based authentication with role-based access control
- **Room Management**: Complete CRUD operations for rooms with image upload support
- **Dynamic Availability**: Real-time room availability tracking with date overlap prevention
- **Booking System**: Comprehensive booking with guest details, services, and pricing calculations
- **Payment Integration**: Razorpay payment gateway integration with order verification
- **Email Notifications**: Automated booking confirmation and cancellation emails
- **Image Upload**: Cloudinary integration for room image management
- **Admin Dashboard**: Complete admin panel with statistics and management tools
- **Data Validation**: Comprehensive input validation and error handling
- **Rate Limiting**: API rate limiting for security
- **Database**: MongoDB with proper indexing and relationships

### Frontend Features
- **Responsive Design**: Mobile-first responsive design with Tailwind CSS
- **Room Browsing**: Interactive room listing with filtering and search
- **Booking Flow**: Multi-step booking process with form validation
- **Payment Interface**: Integrated Razorpay payment gateway
- **User Dashboard**: Personal booking management and history
- **Admin Interface**: Full admin dashboard with room, booking, and user management
- **Error Handling**: Comprehensive error boundaries and user feedback
- **Loading States**: Proper loading indicators throughout the application
- **Modern UI**: Clean, professional design with smooth animations

## Tech Stack

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with bcrypt
- **File Upload**: Multer with Cloudinary
- **Email**: Nodemailer
- **Payment**: Razorpay
- **Validation**: Express Validator
- **Security**: Helmet, CORS, Rate Limiting

### Frontend
- **Framework**: Next.js 15 with React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom components with Lucide React icons
- **Animation**: Framer Motion
- **Forms**: React Hook Form
- **HTTP Client**: Fetch API with custom API client
- **State Management**: React useState/useEffect

## Installation

### Prerequisites
- Node.js 18+ 
- MongoDB 4.4+
- Cloudinary account (for image uploads)
- Razorpay account (for payments)
- Gmail account (for email notifications)

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd resort-booking-system/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp .env.example .env
   ```
   
   Fill in the environment variables:
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development

   # Database
   MONGO_URI=mongodb://localhost:27017/resort-booking

   # JWT
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRE=7d

   # Razorpay
   RAZORPAY_KEY_ID=your-razorpay-key-id
   RAZORPAY_KEY_SECRET=your-razorpay-key-secret

   # Email Configuration
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   EMAIL_FROM="Resort Booking <your-email@gmail.com>"

   # Cloudinary
   CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
   CLOUDINARY_API_KEY=your-cloudinary-api-key
   CLOUDINARY_API_SECRET=your-cloudinary-api-secret

   # Frontend URL
   FRONTEND_URL=http://localhost:3000
   ```

4. **Create the admin user**
   ```bash
   npm run setup:admin
   ```

5. **Start the backend server**
   ```bash
   npm run dev
   ```

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd ../frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in the environment variables:
   ```env
   NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
   NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id
   ```

4. **Start the frontend server**
   ```bash
   npm run dev
   ```

## API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Room Endpoints
- `GET /api/rooms` - Get available rooms (public)
- `GET /api/rooms/:id` - Get room details (public)

### Booking Endpoints
- `POST /api/bookings` - Create new booking
- `GET /api/bookings/user` - Get user bookings
- `GET /api/bookings/:id` - Get booking details
- `PATCH /api/bookings/:id/cancel` - Cancel booking

### Payment Endpoints
- `POST /api/payments/create-order` - Create Razorpay order
- `POST /api/payments/verify` - Verify payment

### Admin Endpoints
- `GET /api/admin/dashboard` - Dashboard statistics
- `GET /api/admin/rooms` - Get all rooms
- `POST /api/admin/rooms` - Create room
- `PUT /api/admin/rooms/:id` - Update room
- `DELETE /api/admin/rooms/:id` - Delete room
- `GET /api/admin/rooms/availability` - Check availability
- `PATCH /api/admin/rooms/bulk-availability` - Bulk update availability
- `GET /api/admin/bookings` - Get all bookings
- `PUT /api/admin/bookings/:id/status` - Update booking status
- `GET /api/admin/users` - Get all users

## Database Schema

### User Model
```typescript
interface IUser {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: 'user' | 'admin';
  isActive: boolean;
  lastLogin?: Date;
}
```

### Room Model
```typescript
interface IRoom {
  roomNumber: string;
  roomType: 'AC' | 'Non-AC';
  pricePerNight: number;
  capacity: number;
  amenities: string[];
  isAvailable: boolean;
  description?: string;
  images: string[];
}
```

### Booking Model
```typescript
interface IBooking {
  userId: ObjectId;
  roomId: ObjectId;
  checkIn: Date;
  checkOut: Date;
  guests: IGuestInfo[];
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  // ... additional fields
}
```

## Frontend Routes

### Public Routes
- `/` - Homepage
- `/rooms` - Room listings
- `/services` - Services page
- `/auth/login` - Login page
- `/auth/register` - Registration page

### Protected Routes (User)
- `/booking` - Booking form
- `/booking/complete` - Booking completion
- `/dashboard` - User dashboard

### Protected Routes (Admin)
- `/admin` - Admin dashboard
- `/admin/rooms` - Room management
- `/admin/bookings` - Booking management
- `/admin/users` - User management

## Key Features Implementation

### Room Availability System
The system implements real-time room availability checking:
- Prevents double bookings for the same dates
- Dynamic pricing based on room type and season
- Bulk availability updates for admin

### Payment Flow
1. User completes booking form
2. Booking is created with 'pending' status
3. Razorpay payment order is created
4. User completes payment
5. Payment is verified via webhook
6. Booking status updated to 'confirmed'
7. Confirmation email sent

### Image Management
- Cloudinary integration for image storage
- Multiple image upload for rooms
- Automatic image optimization and resizing
- Secure image URLs with transformations

### Email Notifications
- Booking confirmation emails
- Booking cancellation notifications
- Admin notification for new bookings
- Customizable email templates

## Security Features

- **Authentication**: JWT tokens with secure secret
- **Authorization**: Role-based access control
- **Rate Limiting**: API endpoint protection
- **Input Validation**: Comprehensive data validation
- **SQL Injection Prevention**: MongoDB injection protection
- **CORS**: Proper cross-origin resource sharing
- **Password Security**: Bcrypt hashing
- **File Upload Security**: Type and size restrictions

## Error Handling

### Backend
- Global error handler middleware
- Async error catching
- Detailed error logging
- User-friendly error messages
- Validation error formatting

### Frontend
- Error boundaries for component crashes
- API error handling with retry mechanisms
- Form validation with user feedback
- Network error detection and messaging
- Loading states for better UX

## Deployment

### Backend Deployment
1. Build the TypeScript code: `npm run build`
2. Set environment variables on hosting platform
3. Deploy to platforms like Heroku, Railway, or DigitalOcean
4. Ensure MongoDB connection string is updated

### Frontend Deployment
1. Build the Next.js app: `npm run build`
2. Deploy to Vercel, Netlify, or similar platforms
3. Update API base URL environment variable
4. Configure domain and SSL

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and test thoroughly
4. Commit with descriptive messages
5. Push to your fork and submit a pull request

## License

This project is licensed under the MIT License. See the LICENSE file for details.

## Support

For support and questions:
- Create an issue on GitHub
- Contact the development team
- Check the documentation for common solutions

## 👨‍💼 Admin Access

The system includes a built-in admin user for system management:

### Admin Credentials:
- **URL**: http://localhost:3000/admin/login
- **Email**: admin@gmail.com
- **Password**: password

### Admin Setup:
After setting up the backend, run the admin setup script:
```bash
cd backend
npm run setup:admin
```

This will create the admin user in your database automatically.

### Admin Features:
- **Dashboard**: Overview of bookings, revenue, and occupancy
- **Room Management**: Add, edit, delete rooms with image uploads
- **Booking Management**: View and manage all customer bookings
- **User Management**: View and manage user accounts
- **Real-time Statistics**: Live data on resort performance

The admin panel is accessible via the "Admin" link in the main website header or by directly visiting `/admin/login`.

---

**Kshetra Retreat Resort Booking System** - A complete solution for resort management and bookings.# Booking-Kshetra
