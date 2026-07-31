import { FilterQuery } from "mongoose";
import { TBike } from "./bike.interface";
import { Bike } from "./bike.model";
import AppError from "../../errors/AppError";
import httpStatus from 'http-status';

const createBikeInDB = async (bikeData: TBike) => {
    if (await Bike.isBikeExists(bikeData.modelNumber)) {
        // throw new Error("Bike already exists");
        throw new AppError(httpStatus.CONFLICT, "Bike with this model number already exists");
    }
    const result = await Bike.create(bikeData);
    return result;
};

// export const getAllBikesFromDB = async (filter: FilterQuery<TBike>) => {
//     try {
//         const bikes = await Bike.find(filter);
//         return bikes;
//     } catch (error: unknown) {
//         console.error("Error fetching bikes:", error);
//         throw new Error("Error fetching bikes from database");
//     }
// };

const getAllBikesFromDB = async (query: {
    filter?: FilterQuery<TBike>;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    category?: string;
}) => {
    // const { filter = {}, page = 1, limit = 10, sortBy = "createdAt", sortOrder = "desc" } = query;
    const { filter = {}, page = 1, limit = 30, sortBy = "createdAt", sortOrder = "desc" } = query;

    const finalFilter = { ...filter, isDeleted: false }; // Exclude soft-deleted bikes
    const sortOptions: Record<string, 1 | -1> = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

    const skip = (page - 1) * limit;

    const bikes = await Bike.find(finalFilter)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit);

    const total = await Bike.countDocuments(finalFilter);

    return {
        data: bikes,
        meta: {
            total,
            page,
            limit,
        },
    };
};

// const getSingleBikeFromDB = async (id: string) => {
//     const result = await Bike.aggregate([{ $match: { modelNumber: id } }]);
//     return result;
// };
const getSingleBikeFromDB = async (id: string) => {
    const bike = await Bike.findById(id);
    if (!bike || bike.isDeleted) {
        throw new AppError(httpStatus.NOT_FOUND, 'Bike not found');
    }
    return bike;
};
// const getSingleBikeFromDB = async (id: string) => {
//     const bike = await Bike.findById(id);
//     if (!bike || bike.isDeleted) {
//         throw new AppError(httpStatus.NOT_FOUND, "Bike not found");
//     }
//     return bike;
// };

const getBikeByIdOrModelNumber = async (identifier: string) => {
    const bike = await Bike.findOne({
        $or: [{ _id: identifier }, { modelNumber: identifier }],
    });

    if (!bike) {
        throw new Error("Bike not found");
    }
    return bike;
};

const getBikeById = async (productId: string) => {
    // try {
    //     const bike = await Bike.findById(productId);
    //     console.log('getbbid:',bike);
    //     if (!bike || bike.isDeleted) {
    //         throw new AppError(httpStatus.NOT_FOUND, "Bike not found");
    //     }
    //     return bike;
    // } catch (error: unknown) {
    //     console.error("Error fetching bike by ID:", error);
    //     throw new Error("Invalid ID format or database error");
    // }
    const bike = await Bike.findById(productId);
    if (!bike || bike.isDeleted) {
        throw new AppError(httpStatus.NOT_FOUND, "Bike not found");
    }
    return bike;
};

// const deleteBikeFromDB = async (_id: string) => {
//     const result = await Bike.updateOne({ _id }, { isDeleted: true });
//     return result;
// };

const deleteBikeFromDB = async (id: string) => {
    const bike = await Bike.findById(id);

    if (!bike || bike.isDeleted) {
        throw new AppError(httpStatus.NOT_FOUND, "Bike not found");
    }

    // Soft delete
    const result = await Bike.findByIdAndUpdate(
        id,
        { isDeleted: true },
        { new: true }
    );

    return result;
};

// const updateBikeInDB = async (productId: string, updateData: Partial<TBike>) => {
//     try {
//         if (!mongoose.Types.ObjectId.isValid(productId)) {
//             throw new Error("Invalid Product ID");
//         }
//         const updatedBike = await Bike.findByIdAndUpdate(
//             productId,
//             { ...updateData, updatedAt: new Date() },
//             { new: true, runValidators: true }
//         );
//         if (!updatedBike) {
//             throw new Error("Bike not found or could not be updated");
//         }
//         return updatedBike;
//     } catch (error: unknown) {
//         console.error("Error updating bike:", error);
//         throw new Error("An error occurred while updating the bike");
//     }
// };

const updateBikeInDB = async (id: string, updateData: Partial<TBike>) => {
    const bike = await Bike.findById(id);

    if (!bike || bike.isDeleted) {
        throw new AppError(httpStatus.NOT_FOUND, "Bike not found");
    }
    // Prevent model number change
    if (updateData.modelNumber && updateData.modelNumber !== bike.modelNumber) {
        throw new AppError(httpStatus.BAD_REQUEST, "Model number cannot be changed");
    }
    const updatedBike = await Bike.findByIdAndUpdate(
        id,
        { ...updateData, updatedAt: new Date() },
        { new: true, runValidators: true }
    );
    return updatedBike;
};

export const BikeServices = {
    createBikeInDB,
    getAllBikesFromDB,
    getSingleBikeFromDB,
    deleteBikeFromDB,
    getBikeByIdOrModelNumber,
    getBikeById,
    updateBikeInDB,
};
