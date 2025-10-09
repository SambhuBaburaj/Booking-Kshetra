import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Accommodation } from '../models';

dotenv.config();

const accommodationsData = [
  {
    name: 'King Sized Room',
    description: 'Spacious room with king-size bed and premium amenities',
    price: 'Starting from ₹3,500/night',
    colorTheme: 'blue',
    iconType: 'bed',
    images: [
      'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1566665797739-1674de7a421a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ],
    externalLink: 'https://live.ipms247.com/booking/book-rooms-kshetraretreatvarkala',
    isActive: true,
    displayOrder: 1
  },
  {
    name: 'Queen Sized Room',
    description: 'Comfortable room with queen-size bed and modern facilities',
    price: 'Starting from ₹2,800/night',
    colorTheme: 'green',
    iconType: 'bed',
    images: [
      'https://images.unsplash.com/photo-1595576508898-0ad5c879a061?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1599619351208-3e6dce20c86c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ],
    externalLink: 'https://live.ipms247.com/booking/book-rooms-kshetraretreatvarkala',
    isActive: true,
    displayOrder: 2
  },
  {
    name: 'Dormitory',
    description: 'Shared accommodation perfect for budget travelers and groups',
    price: 'Starting from ₹1,200/night per bed',
    colorTheme: 'purple',
    iconType: 'users',
    images: [
      'https://images.unsplash.com/photo-1555854877-bab0e655cdce?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1540518614846-7eded47ee4cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ],
    externalLink: 'https://live.ipms247.com/booking/book-rooms-kshetraretreatvarkala',
    isActive: true,
    displayOrder: 3
  }
];

const seedAccommodations = async () => {
  try {
    console.log('🌱 Starting accommodation seeding...');

    // Connect to database
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || process.env.DATABASE_URL;
    if (!mongoUri) {
      throw new Error('MongoDB URI not found in environment variables. Expected MONGO_URI, MONGODB_URI, or DATABASE_URL');
    }

    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Check if accommodations already exist
    const existingAccommodations = await Accommodation.countDocuments();
    if (existingAccommodations > 0) {
      console.log(`⚠️  Found ${existingAccommodations} existing accommodations. Skipping seed.`);
      console.log('💡 To re-seed, first delete existing accommodations from the database.');
      process.exit(0);
    }

    // Create accommodations
    console.log('🏨 Creating accommodation records...');

    for (const accommodationData of accommodationsData) {
      const accommodation = new Accommodation(accommodationData);
      await accommodation.save();
      console.log(`✅ Created: ${accommodation.name}`);
    }

    console.log('\n🎉 Successfully seeded accommodations!');
    console.log(`📊 Total accommodations created: ${accommodationsData.length}`);

    // Display summary
    console.log('\n📋 Accommodation Summary:');
    accommodationsData.forEach((acc, index) => {
      console.log(`${index + 1}. ${acc.name} (${acc.colorTheme}, ${acc.iconType})`);
      console.log(`   Price: ${acc.price}`);
      console.log(`   Images: ${acc.images.length} photos`);
      console.log('');
    });

    console.log('🎯 Next steps:');
    console.log('1. Visit the admin panel at /admin/accommodations to manage these');
    console.log('2. Check the homepage to see the dynamic accommodations in action');
    console.log('3. You can now add, edit, or remove accommodations through the admin interface');

  } catch (error: any) {
    console.error('❌ Error seeding accommodations:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
};

// Run the seed function
if (require.main === module) {
  seedAccommodations();
}

export default seedAccommodations;