//permission.js

const express = require('express');
const router = express.Router();
const db = require('../../db-module.js');


router.get('/permissions', async (req, res) => {
    try {
        const permissions = await db.getAll('permission');
        console.log(`Fetching permissions...`);
        res.json(permissions);
    } catch (error) {
        console.error('Error fetching permissions:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/permission/:id', async (req, res) => {
    try {
        const permissions = await db.getAll('permission');
        console.log(`Fetching permissions...`);
        res.json(permissions);
    } catch (error) {
        console.error('Error fetching permissions:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/get-permission-board/:boardId/:userId', async (req, res) => {
    // 1. Extracción correcta de parámetros
    const board_id = parseInt(req.params.boardId, 10);
    const associatedUserId = parseInt(req.params.userId, 10);

    try {
        // 2. Obtener el tablero (asumiendo que db.getAll devuelve un array)
        const boards = await db.getAll("board", { board_id: board_id });
        
        if (!boards || boards.length === 0) {
            return res.status(404).json({ error: 'Board no encontrado' });
        }

        const linkedProjectId = boards[0].linked_project_id;

        // 3. Buscar permisos usando el ID del proyecto y del usuario
        const permissions = await db.getAll('permission', {
            linked_project_id: linkedProjectId, 
            associated_user_id: associatedUserId
        });

        res.json(permissions);
    } catch (error) {
        console.error('Error fetching permissions:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/projects/:id/permissions', async (req, res) => {
  const { id } = req.params;
  const projectId = parseInt(id, 10);
  const { body: { associated_user_id } } = req.body;
  const associatedUserId = parseInt(associated_user_id, 10);

    try {
        const permissions = await db.getAll('permission', {linked_project_id: projectId, associated_user_id: associatedUserId});
        console.log(`Fetching permissions...`);
        res.json(permissions);
    } catch (error) {
        console.error('Error fetching permissions:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/users/:id/permissions', async (req, res) => {
  const { id } = req.params;
  const userId = parseInt(id, 10);

  try {
    const permissions = await db.getAll('permission', { associated_user_id: userId });

    // Si no hay permisos, devolver array vacío SIEMPRE
    if (!permissions || permissions.length === 0) {
      return res.json([]);
    }

    // Recorremos cada permiso y agregamos datos extra
    for (const perm of permissions) {
      const project = await db.getAll('project', { id: perm.linked_project_id });
      const projectName = project?.[0]?.name || "Proyecto no encontrado";

      // El usuario dueño del proyecto
      const owner = project?.[0]?.associated_user_id
        ? await db.getAll('user', { id: project[0].associated_user_id })
        : null;

      const userName = owner?.[0]?.username || "Usuario no encontrado";

      perm.project_name = projectName;
      perm.user_name = userName;
    }

    res.json(permissions);

  } catch (error) {
    console.error("Error fetching permissions:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


router.post('/create-permission/:id', async (req, res) => {
  console.log("creando permiso...")
  const { body: { userName } } = req.body;
  const { body: { associated_user_id } } = req.body;
  const { id } = req.params;
  const { body: { permission } } = req.body;

  
  
  const projectId = parseInt(id, 10);
  try {
    // Verificar si el usuario existe
    const user = await db.getAll('user', {username: userName});
   // console.log(user);
    if (!user) {
      return res.status(404).json({ error: 'El usuario no existe' });
    }
  
    console.log(user)
    const userId = user[0].id;

    // no permitir creacion de permiso si el id de usuario coincide con el id encontrado por el formulario
    if(userId == associated_user_id){
      return res.status(406).json({ error: 'El dueño del proyecto se esta creando un permiso para si mismo' });
    }
   // console.log(userId)
    // Verificar si el permiso ya existe para ese usuario y proyecto
    const existingPermissions = await db.getAll('permission');
    const alreadyExists = existingPermissions.some(
      (p) =>
        p.associated_user_id === userId &&
        p.linked_project_id === projectId
    );

    if (alreadyExists) {
      return res.status(400).json({ error: 'El permiso ya existe para este usuario en este proyecto' });
    }

    // Crear nuevo permiso
    const newPermissionId = existingPermissions.length;
    await db.create('permission', {
      permission_id: newPermissionId,
      linked_project_id: projectId,
      associated_user_id: userId,
      type: permission
    });

    console.log('Permission created');
    res.status(201).json({ message: 'Permiso creado correctamente' });

  } catch (error) {
    console.error('Error creating permission:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.put('/update-permission-type/:id', async (req, res) => {
  const permission_id = parseInt(req.params.id, 10);
   const { body: { type } } = req.body;
    const success = await db.update('permission', { permission_id }, { type });
    if (success){
        console.log("Updating permission " + permission_id + " permission id with " + type);
        res.json({ success });
    }else{
        console.log("Error updating the note's parent panel id");
    }
});

router.delete('/delete-permission/:id', async (req, res) => {
    const { id } = req.params;
    const permissionId = parseInt(id, 10);
    console.log("Deleting permission with ID " + id);
    const success = await db.remove('permission', { permission_id: permissionId });
    if (success) {
        res.status(201).json({ message: "permission deleted successfully with id" + id });
    } else {
        res.status(404).json({ error: "permission not found." });
    }
});

module.exports = router;