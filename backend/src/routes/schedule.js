/*  schedule.js
 *  This file contains an routes relating to the main TA schedule for the backend
 */

const express = require('express');
const router = express.Router();
const mongodbPromise = require('../utils/mongo');
const { schedule_schema } = require('../schemas/schedule')


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