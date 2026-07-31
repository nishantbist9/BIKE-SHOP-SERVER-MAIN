import express from 'express';
import { OrderController } from './order.controller';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../User/user.constant';

const router = express.Router();

// router.post('/order', OrderController.createOrder);
router.post('/order', OrderController.createOrder);

// router.post('/verify', auth(USER_ROLE.customer), OrderController.verifyPayment);
router.get('/verify', auth(USER_ROLE.customer, USER_ROLE.admin), OrderController.verifyPayment);

// router.get('/revenue', OrderController.calculateRevenue);
router.get('/revenue', auth(USER_ROLE.admin), OrderController.calculateRevenue);

router.get('/', auth(USER_ROLE.admin), OrderController.getOrders);

router.get('/my-orders',
    auth(USER_ROLE.customer),
    OrderController.getMyOrders
);

export const OrderRoutes = router;

