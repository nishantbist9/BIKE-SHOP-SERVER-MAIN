// import { Schema, model, Model, Types } from 'mongoose';
import { Model } from 'mongoose';

export const BIKE_CATEGORY = {
    SPORT: 'Sport',
    ROAD: 'Road',
    HYBRID: 'Hybrid',
    ADVENTURE: 'Adventure'
} as const;

export type TBikeCategory = typeof BIKE_CATEGORY[keyof typeof BIKE_CATEGORY];


// Define the type for the Product (Bike)
export type TBike = {
    modelNumber: string;
    name: string;
    brand: string;
    price: number;
    // category: 'Mountain' | 'Road' | 'Hybrid' | 'Electric';
    category: TBikeCategory;
    description: string;
    image?: string;
    quantity: number;
    inStock: boolean;
    createdAt?: Date;
    updatedAt?: Date;
    isDeleted?: boolean;
};

// Define the type for the Order
// export type TOrder = {
//     email: string;
//     product: Types.ObjectId; // Reference to a Bike's ObjectId
//     quantity: number;
//     totalPrice: number;
//     createdAt?: Date;
//     updatedAt?: Date;
// };

// Extend the Model for static methods for the Bike
export interface BikeModel extends Model<TBike> {
    /* eslint-disable no-unused-vars */
    isBikeAvailable(id: string): Promise<TBike | null>;
    reduceStock(id: string, quantity: number): Promise<void>;
    isBikeExists(modelNumber: string): Promise<boolean>;

}



// Extend the Model for static methods for the Order
// export interface OrderModel extends Model<TOrder> {
//     calculateRevenue(): Promise<number>;
// }

