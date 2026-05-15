////////////////////////////////
// ENTRY FOR POINT /////////////
// for deployement plataforms //
// like Vercel /////////////////
////////////////////////////////

const express = require('express');
const cors = require('cors');
const db = require('./db-module.js'); // Adjust the path accordingly

const projectRouter = require('./api/routes/project.js');
const panelRouter = require('./api/routes/panel.js');
const noteRouter = require('./api/routes/note.js');
const sessionRouter = require('./api/routes/session.js');

const app = express();

// routes
app.use(cors({
    origin: 'https://panelboard-lite.vercel.app',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 204,
  }));
  
app.use(express.json());
app.use('/api', projectRouter);
app.use('/api', panelRouter);
app.use('/api', noteRouter);
app.use('/api', sessionRouter);

app.get('/', async (req, res) => {
  res.send('Welcome to the back-end port');
});

app.get('/check-db-connection', async (req, res) => {
  try {
      const isConnected = await db.checkDatabaseConnection();
      if (isConnected) {
          console.log(`The database was connected successfully`);
          res.json({ isConnected: true });
      } else {
          console.log(`Warning: the server couldn't connect to the database`);
          res.status(500).json({ error: 'Database connection failed' });
      }
  } catch (error) {
      console.error(`Error checking database connection: ${error.message}`);
      res.status(500).json({ error: 'Database connection check failed' });
  }
});

module.exports = app;