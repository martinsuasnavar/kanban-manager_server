//note.js

const express = require('express');
const router = express.Router();
const db = require('../../db-module.js');

router.get('/notes', async (req, res) => {
    try {
        const notes = await db.getAll('note');
        console.log(`Fetching notes...`);
        res.json(notes);
    } catch (error) {
        console.error('Error fetching notes:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.post('/panels/:id/create-note', async (req, res) => {
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

router.put("/update-note/:id", async (req, res) => {
    const { id } = req.params;
    const { body: { content } } = req.body;
    const noteId = parseInt(id, 10);

    try {
        const success = await db.update('note', { note_id: noteId }, { content: content }  );
        console.log("Updating note with ID " + id);
        console.log(`New content is ${content}`);
        res.json({ success });
    } catch (error) {
        console.error("Error updating note: ", error.message);
        res.status(500).json({ error: "Failed to update note" });
    }
});

router.put('/update-note/:id/parent-panel-id', async (req, res) => {
    const { id } = req.params;

    const { body: { parent_panel_id } } = req.body;

    const noteId = parseInt(id, 10);
    const newParentId = parseInt(parent_panel_id, 10);
    
    console.log(`New panel id for this note is ${parent_panel_id}`);
    try {
        const success = await db.update('note', { note_id: noteId }, { parent_panel_id: newParentId });
        res.json({ success });
    } catch (error) {
        console.error("Error updating note: ", error.message);
        res.status(500).json({ error: "Failed to update note" });
    }
});

router.delete('/delete-note/:id', async (req, res) => {
    const { id } = req.params;
    const noteId = parseInt(id, 10);
    console.log("Deleting note with ID " + id);
    const success = await db.remove('note', { note_id: noteId });
    if (success) {
        res.status(201).json({ message: "Note deleted successfully with id" + id });
    } else {
        res.status(404).json({ error: "Note not found." });
    }
});

module.exports = router;