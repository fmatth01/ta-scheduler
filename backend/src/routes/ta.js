/*  ta.js
 *  This file contains an routes relating to TAs for the backend
 */

const express = require('express');
const router = express.Router();
const mongodbPromise = require('../utils/mongo');
const { ta_schema , preference_schema } = require('../schemas/ta');

/* * POST /create :
 *      summary: creates a new TA in the 'ta-scheduler' database 'ta' collection 
 * 
 *      requestBody:
 *          required: true
 *          content:
 *              json:
 *                schema:
 *                  properties:
 *                    ta_id:
 *                      type: String
 *                    first_name:
 *                      type: String
 *                    last_name:
 *                      type: String
 *                    is_tf:
 *                      type: Bool
 *                    lab_perm:
 *                      type: Int
 * 
 *                  required:
 *                      - ta_id
 *                      - first_name
 *                      - last_name
 *                      - is_tf
 *                      - lab_perm
 * 
 *      responses:
 *        200:
 *          description: - a success message and document id returned.
 *        400:
 *          description: - error message when invalid request body is sent to endpoint
 *        500:
 *          description: - an error message and the error caught
 * */
router.post('/create', async (req, res) => {

    try {
        const client = await mongodbPromise;
        const db = client.db('ta-scheduler');
        const collection = db.collection('ta');

        const { error } = ta_schema.validate(req.body);
        
        if (error) {
            return res.status(400).send(error.details[0].message);
        } else {
            const { ta_id, first_name, last_name, is_tf, lab_perm } = req.body;
    
            const newEntry = {
                ta_id,
                first_name,
                last_name,
                is_tf,
                lab_perm,
                preferences: [],
                confirmed_shifts: []
            };
    
            const document = await collection.insertOne(newEntry);
    
            return res.status(200).send({
                message : 'Document successfully created',
                _id: document.insertedId
            });
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

// Initialize Prefernces

const parsePreferenceString = (str) => {
    // Data Format: Ex. [DAY: HH:MM-HH:MM:int[0-2]]
    const lastColon = str.lastIndexOf(':');
    if (lastColon === -1) throw new Error(`Invalid format: ${str}`);

    const pref = parseInt(str.slice(lastColon + 1));
    if (![0, 1, 2].includes(pref)) throw new Error(`Preference must be 0,1,2: ${str}`);

    const timeSlots = str.slice(0, lastColon); // everything before last colon, e.g., "m:7:00-8:30"

    // Validate day and time
    const firstColon = timeSlots.indexOf(':');
    if (firstColon === -1) throw new Error(`Invalid format: ${str}`);

    const day = timeSlots.slice(0, firstColon);
    const timeRange = timeSlots.slice(firstColon + 1);

    const validDays = ['m','tu','w','th','f','sa','su'];
    if (!validDays.includes(day.toLowerCase())) {
        throw new Error(`Invalid day: ${day}`);
    }

    const timePattern = /^\d{1,2}:\d{2}-\d{1,2}:\d{2}$/;
    if (!timePattern.test(timeRange)) {
        throw new Error(`Invalid time format: ${timeRange}`);
    }

    return {
        shift_id: "",       // just empty string
        time_slots: timeSlots,
        preference: pref
    };
};

// Ex. [DAY: HH:MM-HH:MM:int[0-2]]
router.post('/preferences', async (req, res) => {
    // 1. We are grabbing TA from TA schema
    // 2. Parse through given list of preferences
    // 3. Access shifts through preferences parsed
    try {
        const client = await mongodbPromise
        const db = client.db('ta-scheduler')
        const collection = db.collection('ta')

        // const ta_id = req.params.ta_id

        const { ta_id } = req.body

        // Error check the inputs: Preferences Array
        const prefStrings = req.body.preferences
        if (!Array.isArray(prefStrings)) {
            return res.status(400).send({
                    message: 'Preferences must be an array!'
                })
            }
        //Parsing logic
        const preferences = []
        for (let str of prefStrings) {
            try {
                const obj = parsePreferenceString(str);
                const { error } = preference_schema.validate(obj);
                if (error) throw new Error(error.details[0].message);
                preferences.push(obj);
            } catch (e) {
                return res.status(400).send({ message: e.message });
            }
        }

        const ta = await collection.findOne({ta_id});
        
        // Error check if TA doesnt exist
        if (!ta){
            return res.status(404).send({
                message: 'TA not found!'
            })
        }
        // Task: Parse the preferences
        await collection.updateOne(
            {ta_id},
            {$push: {preferences: {$each: preferences}}}
        )

        //Update the actual schedule

        // Success!
        return res.status(200).send({
            message: "TA preferences added sucessfully!"
        })

    } catch(error){
        if (res.headersSent) return;
        return res.status(500).send({
            message: 'Error updating TA preferences',
            error
        })
    }
})




module.exports = router;
