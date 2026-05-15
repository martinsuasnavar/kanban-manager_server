//panel.js

const express = require('express');
const router = express.Router();
const db = require('../../db-module.js');

router.get('/panels', async (req, res) => {
    try {
        const panels = await db.getAll('panel');
        console.log(`Fetching panels...`);
        res.json(panels);
    } catch (error) {
        console.error('Error fetching panels:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.post('/projects/:id/create-panel', async (req, res) => {
    const { id } = req.params;
    const { body: { panel_name } } = req.body;
    console.log(panel_name);
    try {
        // Convert id to a number using parseInt or unary plus operator
        const projectId = parseInt(id, 10); // or const panelId = +id;
        const panels = await db.getAll('panel');
        const newPanelId = panels.length;

        await db.create('panel', { panel_id: newPanelId, panel_name, parent_project_id: projectId });
      
        res.status(201).json({ id: newPanelId });
        console.log("Creating a new panel...");
    } catch (error) {
        console.error('Error creating panel:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/panels/:id/notes', async (req, res) => {
    const { id } = req.params;
    const panelId = parseInt(id, 10);
    try {
        const notes = await db.getAll('note', {parent_panel_id: panelId});
        res.json(notes);
       
    } catch (error) {
        console.error('Error fetching specific notes:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});



router.put('update-note-parent-panel/:id', async (req, res) => {
    const { id } = req.params;
    const { newParentPanelId } = req.body.newParentPanelId;
    const success = await db.update('note', 'content', newParentPanelId, 'note_id', id);
    if (success){
        console.log("Updating note " + id + " parent panel id with " + newParentPanelId);
        res.json({ success });
    }else{
        console.log("Error updating the note's parent panel id");
    }
});

router.delete('/delete-panel/:id', async (req, res) => {
    const { id } = req.params;
    const panelId = parseInt(id, 10);
    console.log("Deleting panel with ID " + id);
    const success = await db.remove('panel', { panel_id: panelId });
    if (success) {
        res.status(201).json({ message: "Panel deleted successfully with id" + id });
    } else {
        res.status(404).json({ error: "Panel not found." });
    }
});


module.exports = router;