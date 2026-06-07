//task.js

const express = require('express');
const router = express.Router();
const db = require('../../db-module.js');
const { link } = require('./session.js');

router.get('/tasks', async (req, res) => {
    try {
        const tasks = await db.getAll('task');
        console.log(`Fetching taskss...`);
        res.json(tasks);
    } catch (error) {
        console.error('Error fetching tasks:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/tasks/:id', async (req, res) => {
    const task_id = parseInt(req.params.id, 10);
    try {
        const task = await db.getAll('task', { task_id: task_id });
        res.json(task);
    } catch (error) {
        console.error('Error fetching task:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


router.get('/columns/:id/tasks', async (req, res) => {
    const linked_column_id = parseInt(req.params.id, 10);
    //console.log("linked column is " + linked_column_id)
    try {
        const tasks = await db.getAll('task', { linked_column_id: linked_column_id });
        //console.log(`Fetching tasks...`);
        res.json(tasks);
    } catch (error) {
        console.error('Error fetching tasks:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.put('/tasks/:id/move', async (req, res) => {
    const task_id = parseInt(req.params.id, 10);
    const { body: { linked_column_id } } = req.body; //task id
    try {
        const task = await db.update('task', { task_id: task_id }, {linked_column_id});
        res.json(task);
    } catch (error) {
        console.error('Error fetching task:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.post('/create-task', async (req, res) => {
    const { body: { linked_column_id } } = req.body; //task id

    try {
        const tasks = await db.getAll('task');
        const newTaskId = tasks.length;

        await db.create('task', { task_id: newTaskId, content: "Nueva tarea", linked_column_id: parseInt(linked_column_id, 10)});
        console.log("task created") 
        res.status(201);

    } catch (error) {
        console.error('Error creating task:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.put('/tasks/:id/update-content', async (req, res) => {
  const task_id = parseInt(req.params.id, 10);
   const { body: { content } } = req.body;
   console.log(`Tarea ${task_id} actualizada a "${content}"`);
 /* if (!content || typeof content !== "string") {
    return res.status(400).json({ error: "Invalid task content" });
  }*/

  try {
    const updated = await db.update('task', { task_id }, { content });
    console.log(`Tarea ${task_id} actualizada a "${content}"`);
    res.status(200).json({ message: "Task content updated", updated });
  } catch (error) {
    console.error('Error updating task content:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.delete('/delete-task/:id', async (req, res) => {
    const { id } = req.params;
    const taskId = parseInt(id, 10);
    console.log("Deleting task with ID " + id);
    const success = await db.remove('task', { task_id: taskId });
    if (success) {
        res.status(201).json({ message: "task deleted successfully with id" + id });
    } else {
        res.status(404).json({ error: "task not found." });
    }
});

module.exports = router;