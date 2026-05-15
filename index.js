////////////////////////////////
// ENTRY FOR POINT /////////////
// for deployement plataforms //
// like Vercel /////////////////
////////////////////////////////

const express = require('express');
const cors = require('cors');


const db = require('./db-module.js');
const projectRouter = require('./api/routes/project.js');
const panelRouter = require('./api/routes/panel.js');
const noteRouter = require('./api/routes/note.js');
const sessionRouter = require('./api/routes/session.js');
const userRouter = require('./api/routes/user.js');
const boardRouter = require('./api/routes/board.js');
const columnRouter = require('./api/routes/column.js');
const taskRouter = require('./api/routes/task.js');
const permissionRouter = require('./api/routes/permission.js');

const app = express();


// routes
app.use(cors({
    origin: 'https://fieldproject-client.vercel.app',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 204,
  }));
/*
app.use(cors
    {
        origin: [""],
        methods: ["POST", "GET", "DELETE", "PUT"];
    }
)
*/
app.use(express.json());
app.use('/api', projectRouter);
app.use('/api', panelRouter);
app.use('/api', noteRouter);
app.use('/api', sessionRouter);
app.use('/api', userRouter);
app.use('/api', boardRouter);
app.use('/api', columnRouter);
app.use('/api', taskRouter);
app.use('/api', permissionRouter);


await db.checkDatabaseConnection();

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

app.get('/api/cron/clean-users', async (req, res) => {
    // Pon aquí la lógica que tenías en autoDeleteOldUsers()
    try {
        // ... tu lógica de borrado ...
        res.status(200).json({ success: true, message: 'Limpieza completada' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = app;