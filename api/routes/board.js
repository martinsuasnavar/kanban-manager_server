//board.js

const express = require('express');
const router = express.Router();
const db = require('../../db-module.js');


router.get('/boards', async (req, res) => {
    try {
        const panels = await db.getAll('board');
        console.log(`Fetching boards...`);
        res.json(panels);
    } catch (error) {
        console.error('Error fetching boards:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.post('/create-board', async (req, res) => {
    const { body: { linked_project_id } } = req.body;

    try {
        const boards = await db.getAll('board');
        const newBoardId = boards.length;

        await db.create('board', { board_id: newBoardId, name: "Nuevo tablero", linked_project_id: linked_project_id});
        console.log("board created") 
        res.status(201);

    } catch (error) {
        console.error('Error creating board:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/projects/:id/boards', async (req, res) => {
    const linked_project_id = parseInt(req.params.id, 10);
    try {
        const boards = await db.getAll('board', { linked_project_id: linked_project_id });
        //console.log(`Fetching boards...`);
        res.json(boards);
    } catch (error) {
        console.error('Error fetching boards:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.put('/boards/:id/update-name', async (req, res) => {
  const board_id = parseInt(req.params.id, 10);
   const { body: { name } } = req.body;

  if (!name || typeof name !== "string") {
    return res.status(400).json({ error: "Invalid board name" });
  }

    console.log("actualizando...")
  try {
    const updated = await db.update('board', { board_id }, { name });
    console.log(`Board ${board_id} renamed to "${name}"`);
    res.status(200).json({ message: "Board name updated", updated });
  } catch (error) {
    console.error('Error updating board name:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/boards/:id', async (req, res) => {
    const board_id = parseInt(req.params.id, 10);
    try {
        const board = await db.getAll('board', { board_id: board_id });
        //console.log(`Fetching boards...`);
        res.json(board);
    } catch (error) {
        console.error('Error fetching column:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/boards/:id/authenticate', async (req, res) => {
    const { id } = req.params; //board id
    const { body: { requestProjectId } } = req.body;
    const { body: { requestUserId } } = req.body;
    const boardId = parseInt(id, 10);
    try {
       
        const selectedBoard = await db.getAll('board', {board_id: boardId});
        if(selectedBoard==null){
            //nothing
            console.error('Error fetching boards:', error.message);
            return;
        }

        const linkedProject = await db.getAll('project', {id: selectedBoard[0].linked_project_id});

        //find if requested user id created linked project
        const user = await db.getAll('user', {id: linkedProject[0].associated_user_id});
        

        const permissions = await db.getAll('permission', {associated_user_id: userId});
        
       // const linkedProject = await db.getAll('project', {id: permissions[0].linked_project_id});
        const associatedUser = await db.getAll('user', {id: linkedProject[0].associated_user_id});
          permissions.forEach((p) => {
        p.user_name = associatedUser[0]?.username || "Usuario no encontrado";
        p.project_name = linkedProject[0]?.name || "Proyecto no encontrado";
      });
        //console.log(`Fetching permissions...`);
        res.json(permissions);
    } catch (error) {
        console.error('Error fetching permissions:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.delete('/delete-board/:id', async (req, res) => {
    const { id } = req.params;
    const boardId = parseInt(id, 10);
    console.log("Deleting board with ID " + id);
    const success = await db.remove('board', { board_id: boardId });
    if (success) {
        res.status(201).json({ message: "board deleted successfully with id" + id });
    } else {
        res.status(404).json({ error: "board not found." });
    }
});

/*
router.post('/projects/:id/boards', async (req, res) => {
    const { id } = req.params;
    const { body: { content } } = req.body;
    try {
        // Convert id to a number using parseInt or unary plus operator
        const panelId = parseInt(id, 10); // or const panelId = +id;
        const notes = await db.getAll('note');
        const newNoteId = notes.length;

        await db.create('note', { note_id: newNoteId, content, parent_panel_id: panelId });
      
        res.status(201).json({ id: newNoteId });
        console.log("Creating a new note...");
    } catch (error) {
        console.error('Error creating note:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
*/

module.exports = router;