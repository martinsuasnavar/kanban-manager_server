
const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

const DB_URI = process.env.DB_URI;
const DB_NAME = process.env.DB_NAME;
console.log("URI: " + DB_URI);
let db;

checkDatabaseConnection();

async function connectToDatabase() {
  try {
    const client = await MongoClient.connect(DB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB');
    db = client.db(DB_NAME);
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
  }
}

// DATABASE CONNECTION CHECK
async function checkDatabaseConnection() {
  try {
    const client = await MongoClient.connect(DB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB');
    db = client.db(DB_NAME);
    return true;
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    return false;
  }
}

// Get all documents from a collection
async function getAll(collectionName, filter = {}) {
  try {
    const collection = db.collection(collectionName);
    const documents = await collection.find(filter).toArray();
    return documents;
  } catch (error) {
    console.error(`Failed to retrieve documents from ${collectionName}:`, error.message);
    return [];
  }
}

// Create a new document in a collection
async function create(collectionName, data = {}) {
  try {
    const collection = db.collection(collectionName);
    const result = await collection.insertOne(data);
    return result.insertedId;
  } catch (error) {
    console.error(`Failed to create document in ${collectionName}:`, error.message);
    return null;
  }
}

// Update a document in a collection
async function update(collectionName, filter, update) {
  try {
    const collection = db.collection(collectionName);
    const result = await collection.updateMany(filter, { $set: update });
    return result.modifiedCount;
  } catch (error) {
    console.error(`Failed to update documents in ${collectionName}:`, error.message);
    return -1;
  }
}

// Delete documents from a collection
async function remove(collectionName, filter) {
  try {
    const collection = db.collection(collectionName);
    const result = await collection.deleteMany(filter);
    return result.deletedCount;
  } catch (error) {
    console.error(`Failed to remove documents from ${collectionName}:`, error.message);
    return -1;
  }
}

module.exports = {
  checkDatabaseConnection,
  getAll,
  create,
  update,
  remove
};