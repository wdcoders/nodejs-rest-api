class ApiResponseHandler {
	constructor(response, statusCode, message) {}

	static success(res, statusCode = 200, data = [], message = '') {
		return res.status(statusCode).json({
			status: true,
			message: message,
			data: data,
		});
	}
}

export default ApiResponseHandler;
