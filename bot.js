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
  } else if (message.includes('2')) {
    return 'Por favor, forneça o ID da consulta que deseja cancelar.';
  } else if (message.includes('3')) {
    return 'Por favor, forneça o ID da consulta e o novo horário desejado.';
  } else if (message.includes('5')) {
    return await getFAQ();
  } else if (message.includes('4')) {
    return 'Por favor, forneça seu feedback.';
  } else {
    return 'Desculpe, não entendi sua solicitação. Tente perguntar sobre agendamento, cancelamento, reagendamento, FAQ ou feedback.';
  }
};

const sendMessage = async (to, message) => {
  try {
    const response = await client.messages.create({
      from: 'whatsapp:+14155238886', 
      to: `whatsapp:${to}`,
      body: message,
    });
    console.log(`Mensagem enviada com sucesso! SID: ${response.sid}`);
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error.response?.data || error.message);
  }
};

const getFAQ = () => {
  return new Promise((resolve, reject) => {
    connection.query('SELECT * FROM faq', (err, results) => {
      if (err) {
        reject('Erro ao buscar FAQs.');
      } else {
        const faqs = results.map((item) => `${item.pergunta}: ${item.resposta}`).join('\n');
        resolve(faqs);
      }
    });
  });
};

const getWelcomeMessage = () => {
  return `Olá! Bem-vindo à Clínica Melhor Saúde. Como posso ajudá-lo hoje? Selecione uma das opções abaixo:

1. Agendar Consulta
2. Cancelar Consulta
3. Reagendar Consulta
4. Deixar Feedback
5. Perguntas Frequentes (FAQ)

Digite "sair" para encerrar o atendimento.`;
};

module.exports = { handleMessage, sendMessage };
