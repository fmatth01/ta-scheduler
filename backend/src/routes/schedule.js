/*  schedule.js
 *  This file contains an routes relating to the main TA schedule for the backend
 */

const express = require('express');
const path = require('path');
const { spawn } = require('child_process');
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

        console.log(`[getSchedule] Requested schedule_id: ${schedule_id}`);

        if (!schedule_id) {
            return res.status(400).send("Param sent is invalid");
        } else {
            const document = await collection.findOne({'schedule_id': schedule_id})

            if (document) {
                console.log(`[getSchedule] Found schedule_id=${schedule_id}`);
                return res.status(200).json(document)
            } else {
                console.log(`[getSchedule] NOT FOUND: schedule_id=${schedule_id}`);
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

router.get('/getLatestScheduleId', async (req, res) => {
    try {
        const client = await mongodbPromise;
        const db = client.db('ta-scheduler');
        const collection = db.collection('schedule');

        const latest = await collection
            .find({}, { projection: { _id: 0, schedule_id: 1 } })
            .sort({ schedule_id: -1 })
            .limit(1)
            .next();

        console.log(`[getLatestScheduleId] Latest schedule_id: ${latest?.schedule_id ?? 'NONE'}`);

        if (!latest || !Number.isInteger(latest.schedule_id)) {
            return res.status(404).send('No schedules found');
        }

        return res.status(200).json({ schedule_id: latest.schedule_id });
    } catch (error) {
        console.log(error);
        if (res.headersSent) return;
        return res.status(500).send({
            message: 'Error connecting to MongoDB: ',
            error
        });
    }
});

router.post('/initSchedule', async (req, res) => {
    // expecting time data from frontend to be formatted "HH:MM"
    console.log(`[initSchedule] Request body:`, req.body);
    const { start_interval_time, end_interval_time, shift_duration, staffing_capacity } = req.body;

    const num_of_shifts = countShifts(start_interval_time, end_interval_time, shift_duration);

    console.log(`[initSchedule] Calculated ${num_of_shifts} shifts per day`);

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

        // Delete ALL existing schedules so only one exists at a time
        const deleteResult = await collection.deleteMany({});
        console.log(`[initSchedule] Deleted ${deleteResult.deletedCount} old schedule(s) from DB`);

        // Always use schedule_id = 1 since we only keep one schedule
        const schedule_id = 1;
        console.log(`[initSchedule] Creating new schedule with schedule_id=${schedule_id}`);

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

                const data = await apiCall('/shift/create', 'post', body, null);
                // Keep full shift objects in schedule arrays for downstream processing.
                schedule[day].push(data.message ?? data);
            }
        }

        console.log(`[initSchedule] Created ${num_of_shifts * 7} total shifts across 7 days`);

        const entry = {
            ...schedule,
            schedule_id,
            start_interval_time,
            end_interval_time,
            shift_duration
        }

        await collection.insertOne(entry);
        console.log(`[initSchedule] Inserted schedule_id=${schedule_id} into DB`);

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

        const { schedule_id, schedule } = req.body

        console.log(`[update] Updating schedule_id=${schedule_id}`);

        if (!Number.isInteger(schedule_id) || !schedule) {
            console.log(`[update] ERROR: Invalid params - schedule_id=${schedule_id}, schedule=${!!schedule}`);
            return res.status(400).send("Either schedule or schedule_id");
        }

        // Use $set so we only update provided fields.
        // This preserves config fields (shift_duration, start_interval_time, etc.)
        // when the algorithm writes back only the day-keyed shift arrays.
        const { _id, schedule_id: _sid, ...fieldsToUpdate } = schedule;

        const results = await collection.updateOne(
            { schedule_id: schedule_id },
            { $set: fieldsToUpdate }
        );

        console.log(`[update] replaceOne result: matchedCount=${results.matchedCount}, modifiedCount=${results.modifiedCount}`);

        if (results.matchedCount === 0) {
            console.log(`[update] WARNING: No schedule found with schedule_id=${schedule_id} to update!`);
            // List all schedule_ids in DB for debugging
            const allSchedules = await collection.find({}, { projection: { schedule_id: 1, _id: 0 } }).toArray();
            console.log(`[update] Existing schedule_ids in DB: ${JSON.stringify(allSchedules)}`);
        }

        return res.status(200).send(results);

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
        // FIX: Sort by schedule_id instead of _id
        const last_schedule = await schedule_collection.find().sort({ schedule_id: -1 }).limit(1).next();

        if (!last_schedule) {
            console.log(`[importDataToAlg] ERROR: No schedules found in DB!`);
            return res.status(404).send('No schedules found');
        }

        const {start_interval_time, end_interval_time, shift_duration, schedule_id} = last_schedule;

        console.log(`[importDataToAlg] Found ${all_tas.length} TAs`);
        console.log(`[importDataToAlg] Latest schedule_id: ${schedule_id}`);
        console.log(`[importDataToAlg] Schedule config: start=${start_interval_time}, end=${end_interval_time}, duration=${shift_duration}`);

        // Log all schedule_ids in DB for debugging
        const allSchedules = await schedule_collection.find({}, { projection: { schedule_id: 1, _id: 0 } }).toArray();
        console.log(`[importDataToAlg] All schedule_ids in DB: ${JSON.stringify(allSchedules)}`);

        for (const ta of all_tas) {
            const id = ta.ta_id
            console.log(`[importDataToAlg] Processing TA '${id}' - ${ta.preferences?.length || 0} raw preferences`);

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

        console.log(`[importDataToAlg] Returning schedule_id=${schedule_id} with ${tas.length} TAs`);

        // Log TA preference details after shift_id mapping
        for (const ta of tas) {
            const prefs = ta.preferences || [];
            const withShiftId = prefs.filter(p => p.shift_id && p.shift_id !== '');
            console.log(`[importDataToAlg] TA '${ta.ta_id}': ${prefs.length} prefs, ${withShiftId.length} with shift_ids`);
        }

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




router.post('/runAlgorithm', async (req, res) => {
    console.log(`[runAlgorithm] Algorithm execution requested`);

    // Path to the Python algorithm entry point
    const algorithmDir = path.resolve(__dirname, '..', '..', '..', 'src', 'algorithm');
    const mainPy = path.join(algorithmDir, 'main.py');

    console.log(`[runAlgorithm] Algorithm dir: ${algorithmDir}`);
    console.log(`[runAlgorithm] main.py path: ${mainPy}`);

    try {
        const result = await new Promise((resolve, reject) => {
            const proc = spawn('python3', [mainPy], {
                cwd: algorithmDir,
                env: { ...process.env },
                timeout: 120000, // 2 minute timeout
            });

            let stdout = '';
            let stderr = '';

            proc.stdout.on('data', (data) => {
                const text = data.toString();
                stdout += text;
                // Stream algorithm logs to backend console in real time
                text.split('\n').forEach(line => {
                    if (line.trim()) console.log(`[ALGORITHM] ${line}`);
                });
            });

            proc.stderr.on('data', (data) => {
                const text = data.toString();
                stderr += text;
                text.split('\n').forEach(line => {
                    if (line.trim()) console.error(`[ALGORITHM ERR] ${line}`);
                });
            });

            proc.on('close', (code) => {
                console.log(`[runAlgorithm] Algorithm process exited with code ${code}`);
                if (code === 0) {
                    resolve({ stdout, stderr, exitCode: code });
                } else {
                    reject(new Error(`Algorithm exited with code ${code}\nstderr: ${stderr}\nstdout: ${stdout}`));
                }
            });

            proc.on('error', (err) => {
                console.error(`[runAlgorithm] Failed to spawn algorithm process:`, err);
                reject(err);
            });
        });

        console.log(`[runAlgorithm] Algorithm completed successfully`);
        return res.status(200).json({
            success: true,
            message: 'Algorithm completed successfully',
            output: result.stdout.slice(-2000), // last 2000 chars of output
        });

    } catch (error) {
        console.error(`[runAlgorithm] Algorithm failed:`, error.message);
        return res.status(500).json({
            success: false,
            message: 'Algorithm execution failed',
            error: error.message,
        });
    }
});

module.exports = router;
