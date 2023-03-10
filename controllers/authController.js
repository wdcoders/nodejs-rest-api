import Joi from 'joi';
import bcrypt from 'bcrypt';
import { RefreshToken, User } from '../models';
import CustomErrorHandler from '../services/CustomErrorHandler';
import JwtService from '../services/JwtService';
import { REFRESH_SECRET } from '../config';

const authController = {
	async register(req, res, next) {
		// validation
		const registerSchema = Joi.object({
			firstName: Joi.string().min(3).required().messages({
				'string.empty': 'First Name is required',
			}),
			email: Joi.string().email().required().messages({
				'string.empty': 'Email is required',
				'string.email': 'Email is not valid',
			}),
			password: Joi.string()
				.required()
				.pattern(new RegExp('^[a-zA-Z0-9]{3,30}$'))
				.messages({
					'string.empty': 'Password is required',
				}),
		});

		const { error } = registerSchema.validate(req.body);

		if (error) {
			return next(error);
		}

		try {
			const exists = await User.exists({ email: req.body.email });
			if (exists) {
				return next(
					CustomErrorHandler.alreadyExists(
						'This email is already taken.'
					)
				);
			}
		} catch (error) {
			return next(error);
		}

		const { firstName, email, password } = req.body;

		// Hash Password
		const hashedPassword = await bcrypt.hash(password, 10);

		// prepared the model
		const user = new User({
			firstName,
			email,
			password: hashedPassword,
		});

		let access_token;
		try {
			const result = await user.save();

			//  token
			access_token = JwtService.sign({
				_id: result._id,
				role: result.role,
			});
			refresh_token = JwtService.sign(
				{
					_id: result._id,
					role: result.role,
				},
				'1yr',
				REFRESH_SECRET
			);

			await RefreshToken.create({
				token: refresh_token,
				userId: result._id,
			});
		} catch (error) {
			return next(error);
		}

		res.json({ access_token, refresh_token });
	},

	async login(req, res, next) {
		// validation
		const loginSchema = Joi.object({
			email: Joi.string().email().required().messages({
				'string.empty': 'Email is required',
				'string.email': 'Email is not valid',
			}),
			password: Joi.string()
				.required()
				.pattern(new RegExp('^[a-zA-Z0-9]{3,30}$'))
				.messages({
					'string.empty': 'Password is required',
				}),
		});

		const { error } = loginSchema.validate(req.body);

		if (error) {
			return next(error);
		}

		let access_token;
		let refresh_token;
		try {
			const user = await User.findOne({ email: req.body.email });

			// console.log(user);
			if (!user) {
				return next(CustomErrorHandler.wrongCredentials());
			}

			const matchPassword = await bcrypt.compare(
				req.body.password,
				user.password
			);

			if (!matchPassword) {
				return next(CustomErrorHandler.wrongCredentials());
			}
			//  token
			access_token = JwtService.sign({
				_id: user._id,
				role: user.role,
			});
			console.log(access_token);

			refresh_token = JwtService.sign(
				{
					_id: user._id,
					role: user.role,
				},
				'1yr',
				REFRESH_SECRET
			);

			console.log(user._id);

			await RefreshToken.create({
				token: refresh_token,
				userId: user._id,
			});
		} catch (error) {
			return next(error);
		}
		res.json({ access_token, refresh_token });
	},

	async refreshToken(req, res, next) {
		// validation
		const refreshValidationSchema = Joi.object({
			refresh_token: Joi.string().required().messages({
				'string.empty': 'Refresh Token is required',
			}),
		});

		const { error } = refreshValidationSchema.validate(req.body);

		if (error) {
			return next(error);
		}

		try {
			const result = await RefreshToken.findOne({
				token: req.body.refresh_token,
			});

			// console.log(user);
			if (!result) {
				return next(
					CustomErrorHandler.unauthorized('Invalid refresh token')
				);
			}

			let userId;
			try {
				const { _id } = await JwtService.verify(
					result.token,
					REFRESH_SECRET
				);

				userId = _id;
			} catch (error) {
				return next(
					CustomErrorHandler.unauthorized('Invalid refresh token')
				);
			}

			const user = await User.findOne({ _id: userId }).select(
				'-password -updatedAt -__v'
			);

			if (!user) {
				return next(CustomErrorHandler.unauthorized('User not found!'));
			}

			// tokens
			const access_token = JwtService.sign({
				_id: user._id,
				role: user.role,
			});

			const refresh_token = JwtService.sign(
				{
					_id: user._id,
					role: user.role,
				},
				'1yr',
				REFRESH_SECRET
			);

			await RefreshToken.create({
				token: refresh_token,
				userId: user._id,
			});

			res.json({ access_token, refresh_token });
		} catch (error) {
			return next(error);
		}
	},

	async logout(req, res, next) {
		// validation
		const refreshValidationSchema = Joi.object({
			refresh_token: Joi.string().required().messages({
				'string.empty': 'Refresh Token is required',
			}),
		});

		const { error } = refreshValidationSchema.validate(req.body);

		if (error) {
			return next(error);
		}

		try {
			await RefreshToken.deleteOne({ token: req.body.refresh_token });
		} catch (error) {
			return next(error);
		}
		res.json({ status: true, message: 'Successfully logged out.' });
	},
};

export default authController;
