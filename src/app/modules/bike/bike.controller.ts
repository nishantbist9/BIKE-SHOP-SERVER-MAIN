import { Request, Response } from 'express';
import { BikeServices } from './bike.service';
import bikeValidationSchema from './bike.validation';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import AppError from '../../errors/AppError';

// const createBike = async (req: Request, res: Response): Promise<void> => {
//     try {
//         const { bike: bikeData } = req.body;

//         // Validate the incoming data using Zod
//         const validatedData = bikeValidationSchema.parse(bikeData);

//         // Save the bike to the database
//         const result = await BikeServices.createBikeInDB(validatedData);
//         // const result = await BikeServices.createBikeInDB(bikeData);

//         // return res.status(200).json({
//         res.status(200).json({
//             success: true,
//             message: 'Bike created successfully',
//             data: result,
//         });
//     }
//     catch (err) {
//         // console.error(err);
//         console.log(err);

//         // Handle validation errors or unexpected errors
//         if (err instanceof Error) {
//             res.status(500).json({
//                 success: false,
//                 message: 'Error creating bike',
//                 error: err.message,
//             });
//         }

//         res.status(500).json({
//             success: false,
//             message: 'An unknown error occurred',
//             error: String(err),
//         });
//     }
// };

const createBike = catchAsync(async (req: Request, res: Response) => {
    const { bike: bikeData } = req.body;
    console.log('f-bc,bikeData',bikeData);
    const validatedData = bikeValidationSchema.parse(bikeData);
    // const transformedData = {
    //     ...bikeData,
    //     modelNumber: bikeData.model, // Map 'model' to 'modelNumber'
    //     image: bikeData.image || '', // Ensure image is never undefined
    // };
    // const validatedData = bikeValidationSchema.parse(transformedData);
    // console.log(validatedData);
    const result = await BikeServices.createBikeInDB(validatedData);

    console.log(result);
    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: 'Bike created successfully',
        data: result,
    });
});

const getAllBikes = async (req: Request, res: Response): Promise<void> => {
    const { page, limit, sortBy, sortOrder, searchTerm, category } = req.query;
    // Build filter object
    const filter: Record<string, unknown> = { isDeleted: false }; // Ensure only non-deleted bikes are fetched
    if (searchTerm) {
        filter.name = new RegExp(searchTerm as string, 'i'); // Search by bike name
    }
    if (category) {
        filter.category = category; // Filter by category if provided
    }
    // Construct query
    const query = {
        filter,
        page: Number(page) || 1,
        // limit: Number(limit) || 10,
        limit: Number(limit) || 30,
        sortBy: (sortBy as string) || 'createdAt',
        sortOrder: (sortOrder as 'asc' | 'desc') || 'desc',
    };
    try {
        const result = await BikeServices.getAllBikesFromDB(query);
        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: 'Bikes fetched successfully',
            meta: {
                limit: query.limit,
                page: query.page,
                total: result.meta.total,
                totalPage: Math.ceil(result.meta.total / query.limit),
            },
            data: result.data,
        });
    } catch (error) {
        sendResponse(res, {
            statusCode: 500,
            success: false,
            message: error instanceof Error ? error.message : 'Internal server error',
            data: null,
        });
    }
};

// const getSingleBike = async (req: Request, res: Response): Promise<void> => {
//     try {
//         const { bikeId } = req.params;

//         const result = await BikeServices.getSingleBikeFromDB(bikeId);

//         res.status(200).json({
//             success: true,
//             message: 'Bike retrieved successfully',
//             data: result,
//         });
//     } catch (err: unknown) {
//         if (err instanceof Error) {
//             res.status(500).json({
//                 success: false,
//                 message: err.message || 'Something went wrong',
//                 error: err,
//             });
//         }
//         // Unexpected error fallback
//         res.status(500).json({
//             success: false,
//             message: 'An unknown error occurred',
//         });
//     }
// };

const getSingleBike = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await BikeServices.getSingleBikeFromDB(id);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Bike retrieved successfully',
        data: result,
    });
});


const getBikeByIdOrModelNumber = async (req: Request, res: Response): Promise<void> => {
    try {
        const { identifier } = req.params;

        const result = await BikeServices.getBikeByIdOrModelNumber(identifier);

        res.status(200).json({
            success: true,
            message: 'Bike retrieved successfully',
            data: result,
        });
    } catch (err: unknown) {
        if (err instanceof Error) {
            res.status(404).json({
                success: false,
                message: err.message || 'Bike not found',
                error: err,
            });
        }
        // Unexpected error fallback
        res.status(500).json({
            success: false,
            message: 'An unknown error occurred',
        });
    }
};
// export const getBikeById = async (req: Request, res: Response): Promise<Response> => {
export const getBikeById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { productId } = req.params;
        const bike = await BikeServices.getBikeById(productId);

        if (!bike) {
            res.status(404).json({
                success: false,
                message: 'Bike not found',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Bike retrieved successfully',
            data: bike,
        });
    } catch (error) {
        // Narrow the type of error
        if (error instanceof Error) {
            res.status(500).json({
                success: false,
                message: 'An error occurred',
                error: error.message,
            });
        }

        // Handle unexpected error types
        res.status(500).json({
            success: false,
            message: 'An unknown error occurred',
        });
    }
};

// const deleteBike = async (req: Request, res: Response): Promise<Response> => {
const deleteBike = async (req: Request, res: Response): Promise<void> => {
    try {
        const { bikeId } = req.params;

        const result = await BikeServices.deleteBikeFromDB(bikeId);

        // res.status(200).json({
        //     success: true,
        //     message: 'Bike deleted successfully',
        //     data: result,
        // });
        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: 'Bike deleted successfully',
            data: result,
        });
    } catch (err: unknown) {
        if (err instanceof Error) {
            res.status(500).json({
                success: false,
                message: err.message || 'Something went wrong',
                error: err,
            });
        }
        // Unexpected error fallback
        res.status(500).json({
            success: false,
            message: 'An unknown error occurred',
        });
    }
};



export const updateBikeHandler = async (req: Request, res: Response): Promise<void> => {
    const { productId } = req.params; // Extract product ID from route params

    if (!productId) {
        throw new AppError(httpStatus.BAD_REQUEST, 'Bike Not Found !');
    }
    const updateData = req.body;     // Extract update data from request body
    try {
        // Call the service to update the bike
        const updatedBike = await BikeServices.updateBikeInDB(productId, updateData);

        // Respond with the updated bike details
        // res.status(200).json({
        //     success: true,
        //     data: updatedBike,
        // });
        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: 'Bike is updated successfully',
            data: updatedBike,
        });
    } catch (error) {
        // Handle errors and send appropriate response
        if (error instanceof Error) {
            // res.status(400).json({
            //     success: false,
            //     message: error.message || 'Could not update the bike',
            // });
            sendResponse(res, {
                statusCode: httpStatus.BAD_REQUEST,
                success: false,
                message: error.message || 'Could not update the bike',
                data: updateData,
            });
        }

        // Handle unexpected error types
        sendResponse(res, {
            statusCode: httpStatus.BAD_REQUEST,
            success: false,
            message: 'An unknown error occurred',
            data: updateData,
        });
    }
};


export const BikeControllers = {
    createBike,
    getAllBikes,
    getSingleBike,
    deleteBike,
    getBikeByIdOrModelNumber,
    getBikeById,
    updateBikeHandler,
    // createOrderHandler
};

