const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

const DB_URI = process.env.DB_URI;
const DB_NAME = process.env.DB_NAME;

// Guardamos tanto el cliente como la instancia de la base de datos en el scope global
let cachedClient = null;
let cachedDb = null;

/**
 * Asegura y gestiona la conexión a MongoDB reutilizando instancias existentes.
 */
async function checkDatabaseConnection() {
  // Si ya estamos conectados y la referencia está viva, la reutilizamos inmediatamente
  if (cachedClient && cachedDb) {
    try {
      // Pequeño comando rápido para verificar que la conexión con el servidor sigue realmente activa
      await cachedDb.command({ ping: 1 });
      return true;
    } catch (pingError) {
      console.log('[DB] Conexión obsoleta detectada, intentando reconectar...');
      cachedClient = null;
      cachedDb = null;
    }
  }

  // Si no hay conexión o la anterior murió, creamos una nueva
  try {
    console.log('[DB] Iniciando nueva conexión a MongoDB...');
    const client = await MongoClient.connect(DB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    cachedClient = client;
    cachedDb = client.db(DB_NAME);
    
    console.log('[DB] Conexión exitosa establecida.');
    return true;
  } catch (error) {
    console.error('[DB Error] Error crítico al conectar a MongoDB:', error.message);
    cachedClient = null;
    cachedDb = null;
    return false;
  }
}

// Helper interno para obligar a que 'cachedDb' esté listo antes de operar operaciones de lectura/escritura
async function getConnectedDb() {
  await checkDatabaseConnection();
  if (!cachedDb) {
    throw new Error("Base de datos no inicializada. Revisa la conexión con el servidor.");
  }
  return cachedDb;
}

// Get all documents from a collection
async function getAll(collectionName, filter = {}) {
  try {
    const db = await getConnectedDb(); // Asegura la conexión justo a tiempo
    const collection = db.collection(collectionName);
    return await collection.find(filter).toArray();
  } catch (error) {
    console.error(`Failed to retrieve documents from ${collectionName}:`, error.message);
    return [];
  }
}

// Create a new document in a collection
async function create(collectionName, data = {}) {
  try {
    const db = await getConnectedDb();
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
    const db = await getConnectedDb();
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
    const db = await getConnectedDb();
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