const Joi = require('joi');

// Changes made to pattern
const preference_schema = Joi.object({
    shift_id: Joi.string().allow("").required(), /* Shift ID associated w Time Block */
    time_slots: Joi.string().required(), /* Universal times open */
    preference: Joi.number().integer().min(0).max(2).required(), /* 0 - Unavailable, 1 - Available, 2 - Preferred */
})

const ta_schema = Joi.object({
    ta_id: Joi.string().required(),
    first_name: Joi.string().required(),
    last_name: Joi.string().required(),
    is_tf: Joi.boolean().required(),
    lab_perm: Joi.number().min(0).max(2).required(), /* 0 - OH, 1 - LabAssist, 2 - LabLead */
    preferences: Joi.array().items(preference_schema).default([]), /* Time-slots with added date */
    confirmed_shifts: Joi.array().items(Joi.number()).default([])
})


module.exports = { ta_schema, preference_schema }