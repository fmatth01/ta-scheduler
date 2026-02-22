/*
 *  mongodb.js
 *  This file creates a promise that's connected to the MongoDB database.
 * 
 */

const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI;

let client, mongodbPromise;

if (!mongodbPromise) {
    client = new MongoClient(MONGODB_URI);
    mongodbPromise = client.connect();
}

module.exports = mongodbPromise;