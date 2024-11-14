const express = require('express');
const app = express();
const bot = require('./bot');
const { MessagingResponse } = require('twilio').twiml;

const PORT = 3000;

app.use(express.urlencoded({ extended: true }));

app.post('/webhook', async (req, res) => {
  const from = req.body.From;
  const body = req.body.Body;

  const responseMessage = await bot.handleMessage(from, body);

  const twiml = new MessagingResponse();
  twiml.message(responseMessage);

  res.set('Content-Type', 'text/xml');
  res.send(twiml.toString());
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
