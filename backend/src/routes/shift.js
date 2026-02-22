/*  shift.js
 *  This file contains an routes relating to TA shifts for the backend
 */

const express = require('express');
const router = express.Router();
const mongodbPromise = require('../utils/mongo');
const { shifts_schema } = require('../schemas/schedule');

/* * POST /create :
 *      summary: creates a new shift in the 'ta-scheduler' database 'shifts' collection 
 * 
 *      requestBody:
 *          required: true
 *          content:
 *              json:
 *                schema:
 *                  properties:
 *                    shift_id:
 *                      type: String
 *                    start_time:
 *                      type: Date
 *                    end_time:
 *                      type: Date
 *                    is_lab:
 *                      type: Bool
 *                    is_empty:
 *                      type: Bool
 *                    staffing_capacity:
 *                      type: (Int, Int)
 * 
 *                  required:
 *                      - shift_id
 *                      - start_time
 *                      - end_time
 *                      - is_lab
 *                      - is_empty
 *                      - staffing_capacity
 * 
 * 
 *      responses:
 *        200:
 *          description: - a json object is returned.
 *        400:
 *          description: - error message when invalid request body is sent to endpoint
 *        500:
 *          description: - an error message and the error caught
 * */
router.post('/create', async (req, res) => {

    try {
        const client = await mongodbPromise;
        const db = client.db('ta-scheduler');
        const collection = db.collection('shifts');

        const { error } = shifts_schema.validate(req.body);
        
        if (error) {
            return res.status(400).send(error.details[0].message);
        } else {
            const { shift_id,
                    schedule_id, 
                    start_time, 
                    end_time, 
                    is_lab, 
                    is_empty, 
                    staffing_capacity } = req.body;
    
            const newEntry = {
                shift_id,
                schedule_id, 
                start_time, 
                end_time, 
                is_lab, 
                is_empty,
                tas_scheduled: [],
                staffing_capacity
            };
    
            const document = await collection.insertOne(newEntry);
    
            return res.status(200).json(newEntry);
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



module.exports = router;
