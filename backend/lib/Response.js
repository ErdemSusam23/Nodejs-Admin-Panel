const CustomError = require("./Error");
const Enums = require("../config/Enums");

class Response {
    constructor() {}

    static successResponse(data, code = 200) {
        return {
            code,
            data
        };
    }

    // lib/Response.js
static errorResponse(error) {
    if (error instanceof CustomError || (error.code && error.message)) {
        return {
            code: error.code,
            error: { message: error.message, description: error.description }
        };
    }

    // YENİ: Mongoose/MongoDB CastError kontrolü (Geçersiz ID durumları)
    if (error.name === "CastError") {
        return {
            code: Enums.HTTP_CODES.BAD_REQUEST,
            error: {
                message: "Invalid ID Format",
                description: error.message
            }
        };
    }

    return {
        code: Enums.HTTP_CODES.INTERNAL_SERVER_ERROR,
        error: { message: "Unknown Error", description: error.message }
    };
}
}

module.exports = Response;