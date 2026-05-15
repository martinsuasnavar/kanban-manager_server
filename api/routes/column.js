//column.js

const express = require('express');
const router = express.Router();
const db = require('../../db-module.js');

router.get('/columns', async (req, res) => {
    try {
        const panels = await db.getAll('column');
        console.log(`Fetching columns...`);
        res.json(panels);
    } catch (error) {
        console.error('Error fetching columns:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/columns/:id', async (req, res) => {
    const column_id = parseInt(req.params.id, 10);
    try {
        const columns = await db.getAll('column', { column_id: column_id });
        //console.log(`Fetching boards...`);
        res.json(columns);
    } catch (error) {
        console.error('Error fetching column:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/boards/:id/columns', async (req, res) => {
    const linked_board_id = parseInt(req.params.id, 10);
    try {
        const columns = await db.getAll('column', { linked_board_id: linked_board_id });
        //console.log(`Fetching boards...`);
        res.json(columns);
    } catch (error) {
        console.error('Error fetching column:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.delete('/columns/:id', async (req, res) => {
  const column_id = parseInt(req.params.id, 10);
  try {
    const result = await db.remove('column', { column_id });
    res.status(200).json({ message: 'Columna eliminada', deletedCount: result });
  } catch (error) {
    console.error('Error eliminando columna:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/create-column', async (req, res) => {
    const { body: { id } } = req.body; //board id

    

    try {
        const columns = await db.getAll('column');
        const newColumnId = columns.length;

        await db.create('column', { column_id: newColumnId, name: "Nueva columna", linked_board_id: parseInt(id, 10)});
        console.log("column created") 
        res.status(201);

    } catch (error) {
        console.error('Error creating column:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.put('/columns/:id/update-name', async (req, res) => {
  const column_id = parseInt(req.params.id, 10);
   const { body: { name } } = req.body;

  if (!name || typeof name !== "string") {
    return res.status(400).json({ error: "Invalid column name" });
  }

  try {
    const updated = await db.update('column', { column_id }, { name });
    console.log(`Columna ${column_id} renombrada a "${name}"`);
    res.status(200).json({ message: "Column name updated", updated });
  } catch (error) {
    console.error('Error updating column name:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;