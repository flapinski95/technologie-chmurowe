const express = require('express');
const { createClient } = require('redis');

const app = express();
const port = 3000;

const redisClient = createClient({
  url: 'redis://redis:6379' 
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));

app.use(express.json());

app.post('/message', async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'Brak wiadomości' });

  await redisClient.connect();
  await redisClient.rPush('messages', message);
  await redisClient.disconnect();

  res.json({ status: 'Wiadomość dodana!' });
});

app.get('/messages', async (req, res) => {
  await redisClient.connect();
  const messages = await redisClient.lRange('messages', 0, -1);
  await redisClient.disconnect();

  res.json({ messages });
});

app.listen(port, () => {
  console.log(`Aplikacja działa na http://localhost:${port}`);
});