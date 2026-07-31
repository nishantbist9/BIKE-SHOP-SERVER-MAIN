import express from 'express';
import { UserControllers } from './user.controller';
import { createUserValidationSchema, refreshTokenValidationSchema } from './user.validation';
import validateRequest from '../../middlewares/validateRequest';
import auth from '../../middlewares/auth';

const router = express.Router();

router.post(
  '/create-user',
  // auth(USER_ROLE.user),
  validateRequest(createUserValidationSchema),
  UserControllers.createUser,
);

router.post('/register', validateRequest(createUserValidationSchema), UserControllers.createUser)

router.post('/login', UserControllers.loginUser)

router.post(
  '/refresh-token',
  validateRequest(refreshTokenValidationSchema),
  UserControllers.refreshToken
);


// router.get('/', UserControllers.getAllUsers);
router.get('/users', UserControllers.getAllUsers);

// router.get('/:userId', UserControllers.getSingleUser);
router.get('/:id', UserControllers.getSingleUser);

// router.patch('/:id', UserControllers.updateUser);
// router.patch('/:id',
//   auth(USER_ROLE.admin, USER_ROLE.customer),
//   UserControllers.updateUser
// );
router.patch(
  "/update-profile",
  auth("admin", "customer"), // Allow both admins and customers
  UserControllers.updateUser
);

router.put('/:userId', UserControllers.blockUser);

router.delete('/:id', UserControllers.deleteUser);

router.post(
  '/change-password', auth("admin", "customer"),
  // ValidateRequest(changePasswordValidationSchema),
  UserControllers.changePassword,
);


export const UserRoutes = router;
