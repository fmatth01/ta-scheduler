/*  schedule.js
 *  This file contains an routes relating to the main TA schedule for the backend
 */

const express = require('express');
const router = express.Router();
const mongodbPromise = require('../utils/mongo');
const { schedule_schema } = require('../schemas/schedule')

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
            res.status(400).send("Param sent is invalid");
        } else {
            const document = await collection.findOne({'schedule_id': schedule_id})

            if (document) {
                res.status(200).send(JSON.stringify(document))
            } else {
                res.status(404).send(`Cannot find schedule with id: ${schedule_id}`)
            }
        }
    } catch (error) {
        console.log(error);
        res.status(500).send({
            'message': 'Error connecting to MongoDB: ',
            error
        });
    }
});




module.exports = router;