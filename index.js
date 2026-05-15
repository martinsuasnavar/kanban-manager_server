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
    origin: 'https://panelboard-lite.vercel.app',
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

// --- LÓGICA DE LIMPIEZA AUTOMÁTICA ---
const autoDeleteOldUsers = async () => {
    console.log('--- Ejecutando limpieza automática de usuarios desactivados ---');
    try {
        const daysThreshold = 30; // Configurable
        const limitDate = new Date();
        limitDate.setDate(limitDate.getDate() - daysThreshold);

        // Filtro: desactivado Y fecha de desactivación más antigua que 30 días
        const filter = {
            deactivate: true,
            deactivationDate: { $lt: limitDate }
        };

        const deletedCount = await db.remove('user', filter);
        
        if (deletedCount > 0) {
            console.log(`[Cron] Se eliminaron ${deletedCount} usuarios por antigüedad.`);
        }
    } catch (error) {
        console.error('[Cron Error]:', error.message);
    }
};

// Programar la tarea (Ejemplo: Todos los días a las 3:00 AM)
cron.schedule('0 3 * * *', autoDeleteOldUsers);

// Opcional: Ejecutar una vez al arrancar el servidor para limpiar pendientes
// autoDeleteOldUsers(); 
// -------------------------------------

const port = process.env.PORT || 5000;

app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});
s