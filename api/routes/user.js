//users.js

const express = require('express');
const router = express.Router();
const db = require('../../db-module.js');

router.get('/users', async (req, res) => {
       console.log("Getting users...");
    try {
        const users = await db.getAll('user');
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/get-user/:id', async (req, res) => {
        const userId = parseInt(req.params.id, 10);
       console.log("Getting users...");
    try {
        const users = await db.getAll('user', {id: userId});
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.post('/create-user', async (req, res) => {
    // Note: Your destructuring here is a bit unusual. 
    // Usually, it's just const { email, username, password } = req.body;
    // but based on your code:
    const { body: { email, username, password } } = req.body;

    try {
        const users = await db.getAll('user');
        const newUserId = users.length;

        await db.create('user', { 
            id: newUserId, 
            email: email, 
            username: username, 
            password: password 
        });

        console.log("Creating a new user account...");

        // ✅ CRITICAL: Send a response back to the frontend!
        return res.status(201).json({ 
            message: "User created successfully", 
            userId: newUserId 
        });

    } catch (error) {
        console.error('Error creating user account:', error.message);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/get-project-users/:id', async (req, res) => {
    const projectId = parseInt(req.params.id, 10);

    if (isNaN(projectId)) {
        return res.status(400).json({ error: 'ID de proyecto inválido' });
    }

    try {
        // 1. Obtener permisos
        const permissions = await db.getAll('permission', { linked_project_id: projectId });

        if (!permissions.length) {
            return res.json([]);
        }

        // 2. IDs únicos
        const userIds = [...new Set(permissions.map(p => p.associated_user_id))];

        // 3. Traer usuarios (ideal si tu DB permite IN)
        const users = [];
        for (let id of userIds) {
            const user = await db.getAll('user', { id });
            if (user.length) users.push(user[0]);
        }

        // 4. Combinar datos
        const result = users.map(user => {
            const permission = permissions.find(p => p.associated_user_id === user.id);

            return {
                ...user,
                permission_id: permission ? permission.permission_id : null,
                permission_type: permission ? permission.type : null
            };
        });

        res.json(result);

    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

router.get('/check-admin/:id', async (req, res) => {
    //let admin = false;
    const userId = parseInt(req.params.id, 10);
    console.log("Is this user the software master?...");
    try {
        const administrator = await db.getAll('user', {id: userId, admin: true});
        if(administrator.length>0){
            //admin=true;
            res.status(200).json(administrator);
            return;
        }
        res.status(401).json("El usuario no es administrador");
    } catch (error) {
        console.error('Error fetching users:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.put('/activate-user/:id', async (req, res) => {
    const userId = parseInt(req.params.id, 10);

    try {
        const filter = { id: userId };

        // Al activar: deactivate es false y la fecha se vuelve null
        const updateData = { 
            deactivate: false,
            deactivationDate: null 
        };

        const modifiedCount = await db.update('user', filter, updateData);

        if (modifiedCount <= 0) {
            return res.status(200).json({ 
                message: "No se realizaron cambios (el usuario no existe o ya estaba activo)" 
            });
        }

        res.status(200).json({ message: "Usuario activado y fecha de desactivación removida" });

    } catch (error) {
        console.error('Error al activar:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.put('/deactivate-user/:id', async (req, res) => {
    const userId = parseInt(req.params.id, 10);

    try {
        // Solo lo desactivamos si no tiene el campo o si es false
        const filter = { 
            id: userId, 
            deactivate: { $ne: true } // Esto es más flexible que $exists: false
        };

        // Al desactivar: deactivate es true y guardamos el momento exacto
        const updateData = { 
            deactivate: true,
            deactivationDate: new Date() 
        };

        const modifiedCount = await db.update('user', filter, updateData);

        if (modifiedCount <= 0) {
            return res.status(200).json({ 
                message: "El usuario ya está desactivado o no existe" 
            });
        }

        res.status(200).json({ message: "Usuario desactivado con fecha registrada" });

    } catch (error) {
        console.error('Error al desactivar:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;