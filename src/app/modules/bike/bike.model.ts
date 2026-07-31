import { Schema, model } from 'mongoose';
import { TBike, BikeModel, BIKE_CATEGORY } from './bike.interface';
import AppError from '../../errors/AppError';
import httpStatus from 'http-status';
// import { TBike, TOrder, BikeModel, OrderModel } from './bike.interface';
// import validator from 'validator';

// Bike Schema Definition
const bikeSchema = new Schema<TBike, BikeModel>(
  {
    modelNumber: {
      type: String,
      required: [true, 'Model Number is required'],
      unique: true,
      trim: true,
      // validate: {
      //   validator: (value: string) => validator.isAlphanumeric(value),
      //   message: '{VALUE} is not a valid model number',
      // },
    },
    name: {
      type: String,
      required: [true, 'Bike name is required'],
      trim: true,
      maxlength: [50, 'Bike name cannot exceed 50 characters'],
      validate: {
        validator: function (value: string) {
          return value.charAt(0) === value.charAt(0).toUpperCase();
          // const firstNameStr = value.charAt(0).toUpperCase() + value.slice(1);
          // console.log(value);
          // console.log(firstNameStr);
          // return firstNameStr === value;
        },
        message: '{VALUE} is not in capitalize format',
      }
    },
    brand: {
      type: String,
      required: [true, 'Brand is required'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price must be a positive number'],
    },
    category: {
      type: String,
      // enum: ['Mountain', 'Road', 'Hybrid', 'Electric'],
      enum: Object.values(BIKE_CATEGORY),
      required: [true, 'Category is required'],
    },
    image: {  // ✅ 
      type: String,
      // required: true, // Make it required if necessary
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [0, 'Quantity must be a positive number'],
    },
    inStock: {
      type: Boolean,
      default: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    }
  },
  {
    toJSON: {
      virtuals: true,
    },
    timestamps: true,
  }
);

// Virtual Field
// bikeSchema.virtual('availabilityStatus').get(function () {
//   return this.inStock ? 'Available' : 'Out of Stock';
// });

// Middleware - Pre-save hook to ensure stock consistency
bikeSchema.pre('save', async function (next) {
  if (this.quantity === 0) {
    this.inStock = false;
  }
  next();
});

// Middleware - Pre-find hook to exclude soft-deleted items
bikeSchema.pre('find', function (next) {
  this.find({ inStock: true });
  next();
});

// Static Methods
bikeSchema.statics.isBikeAvailable = async function (id: string) {
  // return this.findOne({ _id: id, inStock: true });
  const bike = await this.findOne({ _id: id, inStock: true, isDeleted: false });
  if (!bike) {
    throw new AppError(httpStatus.NOT_FOUND, 'Bike not found or out of stock');
  }
  return bike;
};

bikeSchema.statics.reduceStock = async function (id: string, quantity: number) {
  const bike = await this.findById(id);
  if (!bike || bike.quantity < quantity) {
    throw new Error('Insufficient stock for the bike.');
  }
  if (bike.quantity < quantity) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Insufficient stock');
  }
  bike.quantity -= quantity;
  if (bike.quantity === 0) {
    bike.inStock = false;
  }
  await bike.save();
};

bikeSchema.statics.isBikeExists = async function (modelNumber: string) {
  const bike = await this.findOne({ modelNumber });
  return !!bike; // Return true if a bike exists, otherwise false
};


// Exporting Models
export const Bike = model<TBike, BikeModel>('Bike', bikeSchema);
// export const Order = model<TOrder, OrderModel>('Order', orderSchema);


