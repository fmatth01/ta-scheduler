const Joi = require('joi');

const preference_schema = Joi.object({
    ta_id: Joi.number().required(),
    shift_id: Joi.number().required(),
    preference: Joi.number().min(0).max(2), /* 0 - Unavailable, 1 - Available, 2 - Preferred */
})

const ta_schema = Joi.object({
    ta_id: Joi.string().required(),
    first_name: Joi.string().required(),
    last_name: Joi.string().required(),
    is_tf: Joi.boolean().required(),
    lab_perm: Joi.number().min(0).max(2).required(), /* 0 - OH, 1 - LabAssist, 2 - LabLead */
    preferences: Joi.array().items(preference_schema).default([]),
    confirmed_shifts: Joi.array().items(Joi.number()).default([])
})


module.exports = { ta_schema }