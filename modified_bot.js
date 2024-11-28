
const twilio = require('twilio');
const session = require('express-session');
const connection = require('./db');

const accountSid = 'ACa9e8c48402133934c0cf4deae5c53fe8';
const authToken = 'a6d1798d4065270249cf520e8456ff2f';
const client = new twilio(accountSid, authToken);

const sessions = {};

const handleMessage = async (from, body) => {
  const message = body.toLowerCase();

  if (!sessions[from]) {
    sessions[from] = { welcomeSent: false };
  }

  if (message === 'sair' || message === 'encerrar') {
    delete sessions[from];
    return 'Atendimento encerrado. Para começar novamente, envie qualquer mensagem.';
  }

  if (!sessions[from].welcomeSent) {
    sessions[from].welcomeSent = true;
    return getWelcomeMessage();
  }

  if (message.includes('1')) {
    return 'Para agendar uma consulta, por favor, forneça seu nome, data e horário desejado no formato: "Nome, DD/MM/AAAA, HH:MM".';
  }  

  // Handle scheduling
  const scheduleRegex = /^(.+), (\d{2}\/\d{2}\/\d{4}), (\d{2}:\d{2})$/;
  const match = message.match(scheduleRegex);
  if (match) {
    const [_, name, date, time] = match;
    try {
      const query = 'INSERT INTO consulta (nome, data, horario) VALUES (?, ?, ?)';
      const [result] = await connection.execute(query, [name, date, time]);
      const consultaId = result.insertId;
      return `Consulta agendada com sucesso! O ID da sua consulta é: ${consultaId}`;
    } catch (error) {
      console.error('Erro ao agendar consulta:', error);
      return 'Desculpe, ocorreu um erro ao agendar sua consulta. Por favor, tente novamente.';
    }
  }

  return 'Desculpe, não entendi sua mensagem. Tente novamente ou digite "sair" para encerrar.';
};

const getWelcomeMessage = () => {
  return 'Bem-vindo ao nosso serviço de agendamento. Digite "1" para agendar uma consulta.';
};

module.exports = { handleMessage };
