import Joi from 'joi';

const productSchema = Joi.object({
	title: Joi.string().min(3).required().messages({
		'string.empty': 'Title is required',
	}),
	price: Joi.number().required().messages({
		'string.empty': 'Price is required',
	}),
	size: Joi.string().required().messages({
		'string.empty': 'Size is required',
	}),
});

export default productSchema;
