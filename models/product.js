import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const productSchema = new Schema(
	{
		title: {
			type: String,
			required: true,
		},
		price: {
			type: Number,
		},
		image: {
			type: String,
			required: true,
		},
		size: {
			type: String,
			required: true,
		},
		status: {
			type: Number,
			default: 1,
		},
	},
	{ timestamps: true }
);

export default mongoose.model('Product', productSchema, 'products');
