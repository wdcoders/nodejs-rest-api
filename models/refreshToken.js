import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const refreshTokenSchema = new Schema(
	{
		token: {
			type: String,
			required: true,
			unique: true,
		},
		userId: {
			type: String,
			required: true,
		},
	},
	{ timestamps: false }
);

export default mongoose.model(
	'RefreshToken',
	refreshTokenSchema,
	'refreshTokens'
);
