import { Bike } from '../bike/bike.model';
import { TUser } from '../User/user.interface';
import { Order } from './order.model';
import { orderUtils } from './order.utils';
import AppError from '../../errors/AppError';
import httpStatus from 'http-status';
import QueryBuilder from '../../builder/QueryBuilder';
import config from '../../config';

// Maps Khalti's lookup status to the status codes documented for KPG-2
const khaltiStatusCodeMap: Record<string, number> = {
    Completed: 200,
    Pending: 200,
    Expired: 400,
    Initiated: 200,
    Refunded: 200,
    'User canceled': 400,
    'Partial Refunded': 200,
};

// Maps Khalti's lookup status to our internal order status
const mapKhaltiStatusToOrderStatus = (
    khaltiStatus: string
): 'Pending' | 'Paid' | 'Cancelled' => {
    if (khaltiStatus === 'Completed') return 'Paid';
    if (khaltiStatus === 'User canceled' || khaltiStatus === 'Expired')
        return 'Cancelled';
    return 'Pending';
};
// import { ORDER } from './order.interface';

interface IOrderPayload {
    email: string;
    product: string;
    car: string;
    quantity: number;
    totalPrice: number;
    name?: string;
    address?: string;
    phone_number?: number;
}

const createOrderInDB = async (
    user: TUser,
    payload: IOrderPayload,
    client_ip: string
) => {
    // console.log('f-OS, car:', payload.car);
    // console.log('f-OS, product:', payload.product);
    payload.product = payload.car;
    // console.log('f-OS, payload:', payload);
    // console.log('f-OS, user:', user);

    if (!payload?.product) {
        throw new AppError(httpStatus.NOT_ACCEPTABLE, 'Product is not specified');
    }

    // Find the bike
    const bike = await Bike.findById(payload.product);

    if (!bike) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            `Bike with ID ${payload.product} not found`
        );
    }

    // Calculate total price
    const totalPrice = bike.price * payload.quantity;

    // Check stock
    if (bike.quantity < payload.quantity) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            `Insufficient stock for ${bike.name}`
        );
    }

    // Reduce stock
    await Bike.reduceStock(bike.id, payload.quantity);

    // Create product detail
    const productDetail = {
        product: bike._id,
        quantity: payload.quantity,
        subtotal: totalPrice,
    };

    // Create order in the database
    const order = await Order.create({
        name: payload.name,
        phone_number: payload.phone_number,
        address: payload.address,
        product: bike._id,
        email: payload.email,
        quantity: payload.quantity,
        user: user._id,
        products: [productDetail], // Wrap in array since schema expects array
        totalPrice,
        // status: ,
    });

    // Prepare Khalti ePayment (KPG-2) initiate payload.
    // Khalti expects the amount in paisa (smallest currency unit).
    const khaltiPayload = {
        return_url: config.khalti.khalti_return_url!,
        website_url: config.khalti.khalti_website_url!,
        amount: Math.round(totalPrice * 100),
        purchase_order_id: String(order._id),
        purchase_order_name: bike.name,
        customer_info: {
            name: payload.name || user.name,
            email: payload.email || user.email,
            phone: payload.phone_number ? String(payload.phone_number) : undefined,
        },
    };

    // Initiate payment with Khalti
    const payment = await orderUtils.initiatePayment(khaltiPayload);

    if (payment?.pidx) {
        await order.updateOne({
            transaction: {
                id: payment.pidx,
                transactionStatus: 'Initiated',
                bank_status: 'Initiated',
                sp_code: khaltiStatusCodeMap.Initiated,
                sp_message: 'Payment initiated, awaiting confirmation from Khalti',
                method: 'Khalti',
                date_time: new Date().toISOString(),
            },
        });
    }
    console.log('f-OS, payment-url:', payment.payment_url);

    return payment.payment_url;
};

// const createOrderInDB = async (Orderdata: ORDER, client_ip?: string) => {
//     const result = await Order.create(Orderdata);

//     const shurjopayPayload = {
//         amount: Orderdata.totalPrice * Orderdata.quantity,
//         order_id: result._id,
//         car_id: Orderdata.car,
//         currency: "BDT",
//         customer_name: Orderdata.name,
//         customer_email: Orderdata.email,
//         customer_address: Orderdata.address,
//         customer_phone: Orderdata.phone_number,
//         customer_city: "Tongi",
//         client_ip,
//     };

//     const payment = await orderUtils.makePayment(shurjopayPayload);

//     if (payment?.transactionStatus) {
//         await Order.findOneAndUpdate(
//             { _id: result._id },
//             {
//                 $set: {
//                     transaction: {
//                         id: payment.sp_order_id,
//                         transactionStatus: payment.transactionStatus,
//                     },
//                 },
//                 $setOnInsert: {
//                     createdAt: new Date(),
//                 },
//             },
//             {
//                 new: true,
//                 upsert: true,
//             }
//         );
//     }
//     return payment.checkout_url;
// };



// ---------------- Get Order -------------
// const getOrdersFromDB = async () => {
//     const data = await Order.find().populate('products.product');
//     return data;
// };


const getOrdersFromDB = async (query: Record<string, unknown>) => {
    const orderQuery = new QueryBuilder(Order.find(), query)
        .filter()
        .sort()
        .paginate()
        .fields()
    const result = await orderQuery.modelQuery;
    const meta = await orderQuery.countTotal()
    return {
        result,
        meta
    }
};

const getMyOrdersFromDB = async (email: string, query: Record<string, unknown>) => {

    const orderQuery = new QueryBuilder(
        Order.find({ email }), // Filter by user's email
        query
    )
        .filter()
        .sort()
        .paginate()
        .fields();

    const result = await orderQuery.modelQuery;
    const meta = await orderQuery.countTotal();
    return {
        result,
        meta
    };
};

// ---------------- Get Order -------------



// const verifyPayment = async (orderId: string) => {
//     const order = await Order.findById(orderId);

//     if (!order) {
//         throw new AppError(httpStatus.NOT_FOUND, 'Order not found');
//     }

//     // Add your payment verification logic here
//     const verificationResult = await orderUtils.verifyPayment(orderId);

//     if (verificationResult.status === 'success') {
//         await order.updateOne({
//             'transaction.status': 'completed',
//             'transaction.verifiedAt': new Date(),
//         });
//     }

//     return order;
// };

const verifyPayment = async (pidx: string) => {
    // Only Khalti's status of "Completed" should ever be treated as a
    // successful payment; everything else must be treated as not-yet-paid.
    const verifiedPayment = await orderUtils.verifyPaymentAsync(pidx);

    if (verifiedPayment?.pidx) {
        await Order.findOneAndUpdate(
            {
                "transaction.id": pidx,
            },
            {
                "transaction.bank_status": verifiedPayment.status,
                "transaction.sp_code": khaltiStatusCodeMap[verifiedPayment.status] ?? 400,
                "transaction.sp_message": `Khalti payment ${verifiedPayment.status}`,
                "transaction.transactionStatus": verifiedPayment.status,
                "transaction.method": "Khalti",
                "transaction.date_time": new Date().toISOString(),
                status: mapKhaltiStatusToOrderStatus(verifiedPayment.status),
            }
        );
    }

    // Keep the response shape consistent with the previous (array-based)
    // implementation so existing consumers (e.g. the frontend) keep working.
    return verifiedPayment?.pidx ? [verifiedPayment] : [];
};

export const OrderService = {
    createOrderInDB,
    getOrdersFromDB,
    verifyPayment,
    getMyOrdersFromDB,
};