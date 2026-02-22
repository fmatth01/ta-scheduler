const Joi = required('joi');

const staffing_capacity_schema = Joi.object({
    num_tas: Joi.number().min(1).required(),
    lab_perm: Joi.number().min(0).max(2).required(), /* 0 - OH, 1 - LabAssist, 2 - LabLead */
})

const shifts_schema = Joi.object({
    shift_id: Joi.number().required(),
    start_time: Joi.date().required(),
    end_time: Joi.date().required(),
    is_lab: Joi.boolean().required(),
    is_empty: Joi.boolean().default(true),
    tas_scheduled: Joi.array.items(Joi.string()).default([]),
    staffing_capacity: staffing_capacity_schema
})

const schedule_schema = Joi.object({
    schedule_id: Joi.number().required(),
    monday: Joi.array(Joi.number()),
    tuesday: Joi.array(Joi.number()),
    wednesday: Joi.array(Joi.number()),
    thursday: Joi.array(Joi.number()),
    friday: Joi.array(Joi.number()),
    saturday: Joi.array(Joi.number()),
    sunday: Joi.array(Joi.number()),
})

module.exports = { shifts_schema, schedule_schema }