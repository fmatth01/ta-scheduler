/*  ta.js
 *  This file contains an routes relating to TAs for the backend
 */

const express = require('express');
const router = express.Router();
const mongodbPromise = require('../utils/mongo');
const { ta_schema } = require('../schemas/ta');

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
            res.status(400).send(error.details[0].message);
        } else {
            const { ta_id, first_name, last_name, is_tf, lab_perm } = req.body;
    
            const newEntry = {
                ta_id,
                first_name,
                last_name,
                is_tf,
                lab_perm
            };
    
            const document = await collection.insertOne(newEntry);
    
            res.status(200).send({
                message : 'Document successfully created',
                _id: document.insertedId
            });
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