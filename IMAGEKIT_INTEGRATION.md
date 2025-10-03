# ImageKit Integration Guide

## Overview
This integration replaces Cloudinary with ImageKit for image storage and management across your Booking-Kshetra application. ImageKit provides powerful image optimization, resizing, and delivery features.

## Setup Instructions

### 1. Environment Configuration

Add the following environment variables to your backend `.env` file:

```env
# ImageKit Configuration
IMAGEKIT_PUBLIC_KEY=public_1L5Q+9h8HbEm6hXo8fpjZFXlGGI=
IMAGEKIT_PRIVATE_KEY=private_qxQMNKoehmQK7QKMICbgvQVIGXk=
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/8xufknozx
```

**Important**: Replace the example values with your actual ImageKit credentials.

### 2. Features Implemented

#### Driver Management (Agency Portal)
- **License Image Upload**: Upload and store driver license documents
- **Profile Photo Upload**: Upload driver profile photos
- **Automatic Display**: Profile photos appear in driver cards with fallback to initials

#### Vehicle Management (Agency Portal)
- **Multiple Image Upload**: Upload up to 10 images per vehicle
- **Bulk Upload Support**: Select and upload multiple vehicle images at once

#### Vehicle Rentals (Admin Portal)
- **Vehicle Rental Images**: Upload multiple images for rental vehicles with ImageKit optimization
- **Drag & Drop Interface**: Easy image upload with visual feedback
- **Fallback URL Input**: Manual URL entry still available as backup option

#### Teacher Management (Admin Portal)
- **Teacher Profile Images**: Upload profile photos for both new and existing yoga instructors
- **Smart Upload Flow**: For new teachers, images are uploaded automatically after teacher creation
- **Automatic Display**: Profile images appear in teacher cards with fallback to initials
- **Real-time Updates**: Images update immediately in the interface

#### Yoga Course Management
- **Course Thumbnails**: Upload course images for better visual representation

#### Image Organization
Images are automatically organized into folders:
- `/drivers/licenses/` - Driver license documents
- `/drivers/profiles/` - Driver profile photos
- `/vehicles/` - Vehicle images
- `/yoga/teachers/` - Yoga instructor photos
- `/yoga/courses/` - Yoga course thumbnails

### 3. Image Transformations

The system applies optimized transformations:

- **Profile Photos**: 400x400px, 90% quality
- **Vehicle Photos**: 800x600px, 85% quality
- **Course Thumbnails**: 600x400px, 80% quality
- **License Documents**: 1200x800px, 95% quality (high quality for documents)

### 4. API Endpoints

#### Driver Image Uploads (Agency)
- `POST /api/agency/drivers/:id/upload-license` - Upload driver license
- `POST /api/agency/drivers/:id/upload-photo` - Upload driver profile photo

#### Vehicle Image Uploads (Agency)
- `POST /api/agency/vehicles/:id/upload-images` - Upload vehicle images (multiple)

#### Vehicle Rental Image Uploads (Admin)
- `POST /api/vehicle-rentals/admin/:id/upload-images` - Upload rental vehicle images (multiple)

#### Teacher Image Uploads (Admin)
- `POST /api/yoga/teachers/:id/upload-profile-image` - Upload teacher profile image

### 5. Frontend Usage

#### Driver Management Page (Agency)
1. Navigate to Agency → Drivers
2. Edit an existing driver (image uploads only available for existing drivers)
3. Scroll to "Driver Images" section
4. Upload license image and/or profile photo using drag-and-drop or click to browse

#### Vehicle Rentals Page (Admin)
1. Navigate to Admin → Vehicle Rentals
2. Edit an existing vehicle (image uploads only available for existing vehicles)
3. Find the "Vehicle Images" section
4. Use the ImageKit upload component to drag-and-drop multiple images
5. Or use the manual URL input as fallback

#### Teacher Management Page (Admin)
1. Navigate to Admin → Teachers
2. Click "Add Teacher" for new teachers OR edit an existing teacher
3. In the modal, find the "Profile Image" section
4. Upload a profile photo using drag-and-drop or click to browse
5. For new teachers: Image is stored temporarily and uploaded after teacher creation
6. For existing teachers: Image uploads immediately
7. Images update immediately in the teacher cards

#### Features
- **Drag & Drop Support**: Simply drag images onto the upload area
- **File Validation**: Automatic validation for file type and size
- **Real-time Preview**: See uploaded images immediately
- **Error Handling**: Clear error messages for invalid files
- **Progress Indicators**: Visual feedback during upload

### 6. File Limitations

- **Supported Formats**: PNG, JPG, JPEG, GIF, WebP
- **Size Limits**:
  - Profile Photos: 5MB max
  - License Documents: 10MB max
  - Vehicle Images: 5MB max each
- **Vehicle Images**: Maximum 10 images per vehicle

### 7. Security Features

- **Authentication Required**: All uploads require agency authentication
- **Authorization Checks**: Users can only upload images for their own agency's drivers/vehicles
- **File Type Validation**: Server-side validation of image file types
- **Size Restrictions**: Configurable file size limits

### 8. Database Schema Updates

#### Driver Model
```typescript
interface IDriver {
  // ... existing fields
  licenseImage?: string;    // URL to license image
  profilePhoto?: string;    // URL to profile photo
}
```

#### Vehicle Model
```typescript
interface IVehicle {
  // ... existing fields
  vehicleImages: string[];  // Array of image URLs (max 10)
}
```

#### Yoga Course Model
```typescript
interface IYogaCourse {
  // ... existing fields
  courseImage?: string;     // URL to course thumbnail
}
```

### 9. Migration from Cloudinary

The system maintains backward compatibility:
- Existing Cloudinary configuration is marked as deprecated but still functional
- ImageKit takes precedence when configured
- Gradual migration is possible by configuring ImageKit while keeping Cloudinary as fallback

### 10. Testing the Integration

1. **Start the Backend**:
   ```bash
   cd backend
   npm run dev
   ```

2. **Start the Frontend**:
   ```bash
   cd frontend
   npm run dev
   ```

3. **Test Image Upload**:
   - Login to agency dashboard
   - Go to Drivers section
   - Edit an existing driver
   - Try uploading license and profile images

### 11. Troubleshooting

#### Common Issues:

**"ImageKit not configured" warning**:
- Ensure ImageKit environment variables are set correctly
- Restart the backend server after adding environment variables

**Upload fails with authentication error**:
- Verify you're logged in as an agency user
- Check that the driver/vehicle belongs to your agency

**Images not displaying**:
- Check browser console for CORS errors
- Verify ImageKit URL endpoint is accessible
- Ensure images were uploaded successfully (check database)

#### Debug Mode:
The system falls back to placeholder images when ImageKit is not configured, allowing development without immediate ImageKit setup.

### 12. Performance Benefits

- **Automatic Optimization**: Images are automatically optimized for web delivery
- **Responsive Images**: Different sizes served based on device/screen size
- **CDN Delivery**: Global CDN ensures fast image loading worldwide
- **Lazy Loading**: Frontend implements lazy loading for better performance

This integration provides a robust, scalable image management solution for your booking platform with excellent performance and user experience.