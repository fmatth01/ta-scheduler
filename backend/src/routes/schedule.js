/*  schedule.js
 *  This file contains an routes relating to the main TA schedule for the backend
 */

const express = require('express');
const router = express.Router();
const mongodbPromise = require('../utils/mongo');
const { schedule_schema } = require('../schemas/schedule')
const { apiCall, countShifts, getNextScheduleId, getShiftTimes } = require('../utils/general')

/* * GET /getSchedule :
 *      summary: grabs a schedule from 'ta-scheduler' DB's 'schedule' collection 
 * 
 *      requestQuery:
 *          required: true
 *          content:
 *              schedule_id : int
 *                  required:
 *                      - schedule_id
 * 
 *      responses:
 *        200:
 *          description: - returns a JSON of the schedule object from Mongo
 *        400:
 *          description: - invalid param
 *        404:
 *          description: - schedule with the provided ID isn't in Mongo
 *        500:
 *          description: - an error message and the error caught
 * */
router.get('/getSchedule', async (req, res) => {
    try {
        const client = await mongodbPromise;
        const db = client.db('ta-scheduler');
        const collection = db.collection('schedule');

        const schedule_id = Number(req.query.schedule_id);
        
        if (!schedule_id) {
            return res.status(400).send("Param sent is invalid");
        } else {
            const document = await collection.findOne({'schedule_id': schedule_id})

            if (document) {
                return res.status(200).json(document)
            } else {
                return res.status(404).send(`Cannot find schedule with id: ${schedule_id}`)
            }
        }
    } catch (error) {
        console.log(error);
        if (res.headersSent) return;
        return res.status(500).send({
            'message': 'Error connecting to MongoDB: ',
            error
        });
    }
});

router.post('/initSchedule', async (req, res) => {
    // expecting time data from frontend to be formatted "HH:MM"
    console.log(req.body)
    const { start_interval_time, end_interval_time, shift_duration, staffing_capacity } = req.body;

    const num_of_shifts = countShifts(start_interval_time, end_interval_time, shift_duration);

    console.log(num_of_shifts)

    // for the number of shifts we want to create an array of empty shifts for every day of the week

    const schedule = {
        "monday" : [],
        "tuesday" : [],
        "wednesday" : [],
        "thursday" : [],
        "friday" : [],
        "saturday" : [],
        "sunday" : [],
    }

    const id_date = {
        "monday" : "m",
        "tuesday" : "tu",
        "wednesday" : "w",
        "thursday" : "th",
        "friday" : "f",
        "saturday" : "sa",
        "sunday" : "su",
    }

    try {
        const client = await mongodbPromise;
        const db = client.db('ta-scheduler');
        const collection = db.collection('schedule');

        const schedule_id = await getNextScheduleId(collection);
        
        const shiftTimes = getShiftTimes(start_interval_time, end_interval_time, shift_duration);

        for (const day of Object.keys(schedule)) {
            for (let i = 0; i < num_of_shifts; i++) {
                const { start_time, end_time } = shiftTimes[i];

                const body = {
                        shift_id: `${id_date[day]}` + (i + 1), 
                        schedule_id,
                        start_time, 
                        end_time, 
                        is_lab: false, 
                        is_empty: false, 
                        staffing_capacity
                    }
                
                // console.log(body)
                const data = await apiCall('/shift/create', 'post', body, null);
                // Keep full shift objects in schedule arrays for downstream processing.
                schedule[day].push(data.message ?? data);
            }
        }

        const entry = {
            ...schedule,
            schedule_id,
            start_interval_time, 
            end_interval_time,
            shift_duration
        }   
        
        await collection.insertOne(entry);
    
        return res.status(200).json(entry);
        
    } catch (error) {
        console.log(error);
        if (res.headersSent) return;
        return res.status(500).send({
            'message': 'Error connecting to MongoDB: ',
            error
        });
    }

});

router.put('/update', async (req, res) => {
    try {
        const client = await mongodbPromise;
        const db = client.db('ta-scheduler');
        const collection = db.collection('schedule');

        console.log(req.body)
        const { schedule_id, schedule } = req.body

        if (!Number.isInteger(schedule_id) || !schedule) {
            return res.status(400).send("Either schedule or schedule_id");
        }

        // const { error } = schedule_schema.validate(schedule);

        // if (error) {
        //     res.status(400).send(error.details[0].message);
        // } else {

            const { _id, ...scheduleWithoutId } = schedule;

            const results = await collection.replaceOne(
                { schedule_id: schedule_id },
                { ...scheduleWithoutId, schedule_id }
            );
            
            // const results = await collection.replaceOne(
            //     {schedule_id: schedule_id},
            //     schedule
            // );
            
            return res.status(200).send(results);
        // }

    } catch (error) {
        console.log(error);
        if (res.headersSent) return;
        return res.status(500).send({
            'message': 'Error connecting to MongoDB: ',
            error
        });
    }
});

router.get('/importDataToAlg', async (req, res) => {
    try {
        // Get all TAs from DB
        const client = await mongodbPromise;
        const db = client.db('ta-scheduler');
        const ta_collection = db.collection('ta');
        const schedule_collection = db.collection('schedule');

        const all_tas = await ta_collection.find({}).toArray();
        const last_schedule = await schedule_collection.find().sort({ _id: -1 }).limit(1).next();

        const {start_interval_time, end_interval_time, shift_duration, schedule_id} = last_schedule;

        console.log(all_tas)

        for (const ta of all_tas) {
            const id = ta.ta_id
            
            const body = {
                ta_id: id,
                start_interval: start_interval_time,
                end_interval: end_interval_time,
                shift_duration
            }
            
            await apiCall('/ta/getShiftFromPreferences', 'post', body, null );
            
        }

        const tas = await ta_collection.find({}).toArray();

        const schedule = await schedule_collection.findOne({ schedule_id: schedule_id });

        res.status(200).json({tas, schedule})

    } catch (error) {
         console.log(error);
        if (res.headersSent) return;
        return res.status(500).send({
            'message': 'Error connecting to MongoDB: ',
            error
        });
    }
});




module.exports = router;
