const Joi = require('joi');

const staff_capacity_schema = Joi.array().length(2).ordered(
    /* lab_perm */      Joi.number().integer().min(0).max(2), /* 0 - OH, 1 - LabAssist, 2 - LabLead */
    /* num_tas */       Joi.number().integer().min(1)   
).required();

const shifts_schema = Joi.object({
    shift_id: Joi.string().required(),
    schedule_id: Joi.number().required(),
    start_time: Joi.string().required(),
    end_time: Joi.string().required(),
    is_lab: Joi.boolean().required(),
    is_empty: Joi.boolean().default(true),
    tas_scheduled: Joi.array().items(Joi.string()).default([]),
    staffing_capacity: staff_capacity_schema
})

const schedule_schema = Joi.object({
    schedule_id: Joi.number().required(),
    start_interval_time: Joi.string().required(),
    end_interval_time: Joi.string().required(),
    shift_duration: Joi.number().required(),
    monday: Joi.array().items(shifts_schema),
    tuesday: Joi.array().items(shifts_schema),
    wednesday: Joi.array().items(shifts_schema),
    thursday: Joi.array().items(shifts_schema),
    friday: Joi.array().items(shifts_schema),
    saturday: Joi.array().items(shifts_schema),
    sunday: Joi.array().items(shifts_schema),
})

module.exports = { shifts_schema, schedule_schema }