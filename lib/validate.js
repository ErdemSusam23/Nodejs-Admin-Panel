const Response = require('./Response');
const Enums = require('../config/Enums');

/**
 * Şemayı kontrol eden middleware
 * @param {Object} schema - Joi şeması (örn: Users.create)
 */
const validate = (schema) => {
    return (req, res, next) => {
        const { value, error } = schema.validate(req.body);

        if (error) {
            // Joi hatasını bizim standart Error formatına çeviriyoruz
            const errorMessage = error.details.map(detail => detail.message).join(', ');
            
            // CustomError fırlatmak yerine direkt Response dönüyoruz çünkü bu bir Request hatası
            res.status(Enums.HTTP_CODES.BAD_REQUEST).json(
                Response.errorResponse({
                    code: Enums.HTTP_CODES.BAD_REQUEST,
                    message: "Validation Error",
                    description: errorMessage
                })
            );
            return;
        }

        // Validasyondan geçen temiz veriyi (örn: trimlenmiş stringler) body'ye geri atıyoruz
        Object.assign(req.body, value);
        return next();
    };
};

module.exports = validate;