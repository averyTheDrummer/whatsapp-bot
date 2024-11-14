const twilio = require('twilio');
const connection = require('./db');

const accountSid = 'ACa9e8c48402133934c0cf4deae5c53fe8';
const authToken = 'a6d1798d4065270249cf520e8456ff2f';
const client = new twilio(accountSid, authToken);

const handleMessage = async (from, body) => {
  const message = body.toLowerCase();

  if (
    message.includes('oi') ||
    message.includes('olá') ||
    message.includes('bom dia') ||
    message.includes('boa tarde') ||
    message.includes('boa noite')
  ) {
    return getWelcomeMessage();
  }

  if (message.includes('1')) {
    return 'Para agendar uma consulta, por favor, forneça seu nome, data e horário desejado no formato: "Nome, DD/MM/AAAA, HH:MM".';
  } else if (message.includes('2')) {
    return 'Por favor, forneça o ID da consulta que deseja cancelar.';
  } else if (message.includes('3')) {
    return 'Por favor, forneça o ID da consulta e o novo horário desejado no formato: "ID, DD/MM/AAAA, HH:MM".';
  } else if (message.includes('faq')) {
    return await getFAQ();
  } else if (message.includes('4')) {
    return 'Por favor, forneça seu feedback.';
  } else if (message.match(/^\d+, \d{2}\/\d{2}\/\d{4}, \d{2}:\d{2}$/)) {
    const [id, date, time] = message.split(', ');
    return await reagendarConsulta(id, date, time);
  } else if (message.match(/^\d+$/)) {
    return await cancelarConsulta(message);
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

const cancelarConsulta = (id) => {
  return new Promise((resolve, reject) => {
    connection.query('UPDATE consulta SET status = ? WHERE id = ?', ['cancelada', id], (err, results) => {
      if (err) {
        reject('Erro ao cancelar a consulta.');
      } else if (results.affectedRows > 0) {
        resolve('Consulta cancelada com sucesso.');
      } else {
        resolve('ID da consulta não encontrado.');
      }
    });
  });
};

const reagendarConsulta = (id, date, time) => {
  return new Promise((resolve, reject) => {
    connection.query('UPDATE consulta SET data = ?, hora = ? WHERE id = ?', [date, time, id], (err, results) => {
      if (err) {
        reject('Erro ao reagendar a consulta.');
      } else if (results.affectedRows > 0) {
        resolve('Consulta reagendada com sucesso.');
      } else {
        resolve('ID da consulta não encontrado.');
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
  5. Perguntas Frequentes (FAQ)`;
  };

module.exports = { handleMessage, sendMessage };
