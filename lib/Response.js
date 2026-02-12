const CustomError = require("./Error");
const Enums = require("../config/Enums");

class Response {
    constructor() {};
    static successResponse(data, code = 200){
        return {code, data};
    }
    static errorResponse(error){
        if(error instanceof CustomError)
        {
            return {code: error.code, 
                error: {message: error.message, 
                        description: error.description,
                }
            }
        }; 
        return {code: Enums.HTTP_CODES.INTERNAL_SERVER_ERROR, error: {message: 'Unknown Error', description: error.message} };
        }
        
}

module.exports = Response;