////////////////////////////////
// ENTRY FOR POINT /////////////
// for deployment platforms  ///
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
    origin: 'https://fieldproject-client.vercel.app', // Veo que actualizaste el origen, ¡perfecto!
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 204,
}));

app.use(express.json());


// Intento de conexión asíncrona al arrancar (sin bloquear con await suelto)
db.checkDatabaseConnection()
    .then(isConnected => {
        if (isConnected) console.log('Database connected on startup.');
        else console.log('Database connection pending or lazy-loading.');
    })
    .catch(err => console.error('Error in initial DB check:', err.message));

app.use('/api', projectRouter);
app.use('/api', panelRouter);
app.use('/api', noteRouter);
app.use('/api', sessionRouter);
app.use('/api', userRouter);
app.use('/api', boardRouter);
app.use('/api', columnRouter);
app.use('/api', taskRouter);
app.use('/api', permissionRouter);

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
    console.log('--- Ejecutando limpieza automática de usuarios desactivados ---');
    try {
        const daysThreshold = 30; 
        const limitDate = new Date();
        limitDate.setDate(limitDate.getDate() - daysThreshold);

        const filter = {
            deactivate: true,
            deactivationDate: { $lt: limitDate }
        };

        const deletedCount = await db.remove('user', filter);
        
        if (deletedCount > 0) {
            console.log(`[Cron] Se eliminaron ${deletedCount} usuarios por antigüedad.`);
        }
        
        res.status(200).json({ success: true, message: `Limpieza completada. Usuarios eliminados: ${deletedCount}` });
    } catch (error) {
        console.error('[Cron Error]:', error.message);
        res.status(500).json({ error: error.message });
    }
});

module.exports = app;