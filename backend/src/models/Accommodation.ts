import mongoose, { Document, Schema } from 'mongoose';

export interface IAccommodation extends Document {
  name: string;
  description: string;
  price: string;
  colorTheme: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'teal' | 'pink' | 'indigo';
  iconType: 'bed' | 'users' | 'hotel' | 'home' | 'building';
  images: string[];
  externalLink: string;
  isActive: boolean;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const accommodationSchema = new Schema<IAccommodation>(
  {
    name: {
      type: String,
      required: [true, 'Accommodation name is required'],
      trim: true,
      maxlength: [100, 'Name cannot be more than 100 characters']
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [500, 'Description cannot be more than 500 characters']
    },
    price: {
      type: String,
      required: [true, 'Price is required'],
      trim: true,
      maxlength: [100, 'Price cannot be more than 100 characters']
    },
    colorTheme: {
      type: String,
      required: [true, 'Color theme is required'],
      enum: {
        values: ['blue', 'green', 'purple', 'orange', 'red', 'teal', 'pink', 'indigo'],
        message: 'Color theme must be one of: blue, green, purple, orange, red, teal, pink, indigo'
      }
    },
    iconType: {
      type: String,
      required: [true, 'Icon type is required'],
      enum: {
        values: ['bed', 'users', 'hotel', 'home', 'building'],
        message: 'Icon type must be one of: bed, users, hotel, home, building'
      }
    },
    images: {
      type: [String],
      default: []
    },
    externalLink: {
      type: String,
      required: [true, 'External link is required'],
      trim: true,
      validate: {
        validator: function(v: string) {
          // Basic URL validation
          return /^https?:\/\/.+/.test(v);
        },
        message: 'External link must be a valid URL starting with http:// or https://'
      }
    },
    isActive: {
      type: Boolean,
      default: true
    },
    displayOrder: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

accommodationSchema.index({ displayOrder: 1, isActive: 1 });
accommodationSchema.index({ isActive: 1 });

export default mongoose.model<IAccommodation>('Accommodation', accommodationSchema);