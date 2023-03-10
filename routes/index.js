import express from 'express';
import auth from '../middlewares/auth';
import {
	authController,
	productController,
	userController,
} from './../controllers';

const router = express.Router();

// Auth
router.get('/me', auth, userController.me);
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh-token', authController.refreshToken);
router.get('/logout', auth, authController.logout);

// Products
router.get('/products', productController.index);
router.get('/products/:id', productController.show);
router.post('/products', [auth], productController.store);
router.put('/products/:id', [auth], productController.update);
router.delete('/products/:id', [auth], productController.destroy);

export default router;
