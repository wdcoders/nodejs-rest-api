import { Product, RefreshToken } from '../models';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import CustomErrorHandler from '../services/CustomErrorHandler';
import Joi from 'joi';
import { productSchema } from '../validators';
import ApiResponseHandler from '../services/ApiReponseHandler';
const storage = multer.diskStorage({
	destination: (req, file, cb) => cb(null, 'uploads/'),
	filename: (req, file, cb) => {
		const uniqueSuffix = `${Date.now()}-${Math.round(
			Math.random() * 1e9
		)}${path.extname(file.originalname)}`;
		cb(null, uniqueSuffix);
	},
});

const handleMultipleData = multer({
	storage: storage,
	limits: { fileSize: 1000000 * 5 },
}).single('image');

const productController = {
	// GET ALL PRODUCTS
	async index(req, res, next) {
		try {
			const products = await Product.find();
			return ApiResponseHandler.success(res, 200, products);
		} catch (error) {
			return next(error);
		}
	},

	// GET SINGLE PRODUCT
	async show(req, res, next) {
		try {
			const productId = req.params.id;
			const product = await Product.findById(productId);
			res.json(product);
		} catch (error) {
			return next(error);
		}
	},

	// STORE PRODUCT
	async store(req, res, next) {
		handleMultipleData(req, res, (err) => {
			if (err) {
				return next(CustomErrorHandler.serverError(err));
			}

			const filePath = req.file.path;

			const { title, price, size } = req.body;

			// validation
			const { error } = productSchema.validate(req.body);

			if (error) {
				// Delete the uploaded file
				fs.unlink(`${appRoot}/${filePath}`, (err) => {
					if (err) {
						return next(CustomErrorHandler.serverError(err));
					}
				});
				return next(error);
			}

			try {
				const document = new Product({
					title,
					price,
					size,
					image: filePath,
				});

				document.save();
				return ApiResponseHandler.success(
					res,
					201,
					document,
					'Item added successfully!'
				);
			} catch (error) {
				return next(error);
			}
		});
	},

	// UPDATE PRODUCT
	async update(req, res, next) {
		handleMultipleData(req, res, async (err) => {
			if (err) {
				return next(CustomErrorHandler.serverError(err));
			}

			let filePath;
			if (req.file) {
				filePath = req.file.path;
			}

			const { title, price, size } = req.body;

			// validation

			const { error } = productSchema.validate(req.body);

			if (error) {
				// Delete the uploaded file
				if (req.file) {
					fs.unlink(`${appRoot}/${filePath}`, (err) => {
						if (err) {
							return next(CustomErrorHandler.serverError(err));
						}
					});
				}
				return next(error);
			}

			try {
				const document = await Product.findOneAndUpdate(
					{ _id: req.params.id },
					{
						title,
						price,
						size,
						...(req.file && { image: filePath }),
					},
					{ new: true }
				);
				return ApiResponseHandler.success(
					res,
					200,
					document,
					'Item updated successfully!'
				);
			} catch (error) {
				return next(error);
			}
		});
	},

	// DELETE PRODUCT
	async destroy(req, res, next) {
		try {
			const productId = req.params.id;
			const product = await Product.findById(productId);

			// DELETE PRODUCT IMAGE
			fs.unlink(`${appRoot}/${product.image}`, (err) => {
				if (err) {
					return next(CustomErrorHandler.serverError(err));
				}
			});

			product.delete();

			res.status(200).json({
				status: true,
				message: 'Item deleted successfully.',
			});
		} catch (error) {
			return next(error);
		}
	},
};

export default productController;
