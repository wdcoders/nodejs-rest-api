class CustomErrorHandler extends Error {
	constructor(statusCode, message) {
		super();
		this.statusCode = statusCode;
		this.message = message;
	}

	static alreadyExists(message) {
		return new CustomErrorHandler(409, message);
	}

	static wrongCredentials(message = 'Username or password is wrong!') {
		return new CustomErrorHandler(401, message);
	}

	static unauthorized(message = 'Unauthorized') {
		return new CustomErrorHandler(401, message);
	}

	static notfound(message = '404 Not Found!') {
		return new CustomErrorHandler(404, message);
	}

	static serverError(message = 'Internal server error!') {
		return new CustomErrorHandler(500, message);
	}
}

export default CustomErrorHandler;
