import Joi from 'joi';

export const productSchema = Joi.object({
    name: Joi.string().min(3).max(100).required(),
    description: Joi.string().min(10).max(500).required(),
    price: Joi.number().positive().precision(2).required(),
    stock: Joi.number().integer().min(0).required()
});
