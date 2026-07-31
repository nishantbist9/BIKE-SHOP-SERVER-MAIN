import { Router } from 'express';
import { UserRoutes } from '../modules/User/user.route';
import { BikeRoutes } from '../modules/bike/bike.route';
import { AuthRoutes } from '../modules/Auth/auth.route';
import { OrderRoutes } from '../modules/order/order.route';
// import { OrderRoutes } from './modules/order/order.route';

const router = Router();

const moduleRoutes = [
  {
    path: '/auth',
    route: AuthRoutes, // User registration, login
  },
  {
    path: '/products',
    route: BikeRoutes, // Product(Bike) CRUD operations
  },
  {
    path: '/orders',
    route: OrderRoutes, // Order management and checkout
  },
  {
    // path: '/users',
    path: '/',
    route: UserRoutes, // Manage customers and admins
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
