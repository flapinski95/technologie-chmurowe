require('dotenv').config();
const express = require('express');
const { createClient } = require('redis');
const { pool } = require('./db');

const app = express();
app.use(express.json());

const redisClient = createClient({ url: process.env.REDIS_URL });
redisClient.on('error', err => console.log('Redis error', err));

app.post('/message', async (req, res) => {
  const { message } = req.body;
  await redisClient.connect();
  await redisClient.rPush('messages', message);
  await redisClient.disconnect();
  res.send({ status: 'Message added' });
});

app.get('/messages', async (req, res) => {
  await redisClient.connect();
  const messages = await redisClient.lRange('messages', 0, -1);
  await redisClient.disconnect();
  res.json({ messages });
});

app.post('/users', async (req, res) => {
  const { name } = req.body;
  const result = await pool.query('INSERT INTO users(name) VALUES($1) RETURNING *', [name]);
  res.json(result.rows[0]);
});

app.get('/users', async (req, res) => {
  const result = await pool.query('SELECT * FROM users');
  res.json(result.rows);
});

app.listen(3000, () => console.log('App listening on port 3000'));