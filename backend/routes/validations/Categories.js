const Joi = require('joi');

const create = Joi.object({
    name: Joi.string().required().min(3),
    is_active: Joi.boolean().optional()
});

const update = Joi.object({
    _id: Joi.string().alphanum().length(24).required(), 
    name: Joi.string().min(3).optional(),
    is_active: Joi.boolean().optional()
});

module.exports = {
    create,
    update
};