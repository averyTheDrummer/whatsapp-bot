const twilio = require('twilio');
const session = require('express-session');
const { createConnection } = require('./db');

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

  let conn;
  try {
    conn = await createConnection();
    const query = 'SELECT resposta FROM faq WHERE pergunta LIKE ?';
    const [rows] = await conn.execute(query, [`%${message}%`]); 

    if (rows.length > 0) {
      return `Encontramos uma pergunta similar no nosso FAQ. Aqui está a resposta: ${rows[0].resposta}`;
    }
  } catch (error) {
    console.error('Erro ao processar mensagem:', error);
    return 'Desculpe, ocorreu um erro ao processar sua mensagem.';
  } finally {
    if (conn) await conn.release();
  }

  
  // Controle de agendamento
  if (message === '1') {
    sessions[from].awaitingScheduleData = true;
    return 'Por favor, forneça os dados para agendar a consulta no formato: Nome, DD/MM/AAAA, HH:MM';
  }
  if (sessions[from].awaitingScheduleData) {
    sessions[from].awaitingScheduleData = false;
    return await agendarConsulta(from, message);
  }

  // Controle de cancelamento
  if (message === '2') {
    sessions[from].awaitingCancelData = true;
    return 'Por favor, forneça os dados da consulta que deseja cancelar no formato: Nome, DD/MM/AAAA, HH:MM';
  }

  if (sessions[from].awaitingCancelData) {
    sessions[from].awaitingCancelData = false;
    return await cancelarConsulta(from, message);
  }

  // Controle de reagendamento
  if (message === '3') {
    sessions[from].awaitingRescheduleData = true;
    return 'Por favor, forneça os dados da consulta que deseja reagendar no formato: Nome, DD/MM/AAAA, HH:MM';
  }

  if (sessions[from].awaitingRescheduleData) {
    if (!sessions[from].oldAppointment) {
      sessions[from].oldAppointment = message;
      return 'Agora, forneça a nova data e horário no formato: Nome, DD/MM/AAAA, HH:MM';
    }
    sessions[from].awaitingRescheduleData = false;
    const result = await reagendarConsulta(from, sessions[from].oldAppointment, message);
    delete sessions[from].oldAppointment;
    return result;
  }

  // Controle de feedback
  if (message === '4') {
    sessions[from].awaitingFeedback = true;
    return 'Por favor, nos dê seu feedback sobre a consulta:';
  }

  if (sessions[from].awaitingFeedback) {
    sessions[from].awaitingFeedback = false;
    return await feedbackAtendimento(from, message);
  }

  // FAQ
  if (message === '5') {
    return await getFAQ();
  }

  return 'Desculpe, não entendi sua solicitação. Digite um número de 1 a 5 para selecionar uma opção.';
};

const sendMessage = async (to, message) => {
  let conn;
  try {
    conn = await createConnection();
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

const getWelcomeMessage = () => {
  return `Olá! Bem-vindo à Clínica Melhor Saúde. Como posso ajudá-lo hoje? Selecione uma das opções abaixo:

1. Agendar Consulta
2. Cancelar Consulta
3. Reagendar Consulta
4. Deixar Feedback
5. Perguntas Frequentes (FAQ)

Digite "sair" para encerrar o atendimento.`;
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

//////////////////////////////////////////////////////////////////////////

const agendarConsulta = async (from, message) => {
  
  const regex = /([^,]+),\s*(\d{2}\/\d{2}\/\d{4}),\s*(\d{2}:\d{2})/;
  const match = message.match(regex);

  if (!match) {
    return'Por favor, forneça seus dados no formato: Nome, DD/MM/AAAA, HH:MM';
  }

  const [_, name, date, time] = match;

  const [day, month, year] = date.split('/');
  const formattedDate = `${year}-${month}-${day}`;

  let conn;
  try {
    console.log('Dados extraídos:', { name, formattedDate, time });
    const conn = await createConnection();
    const insertQuery = 'INSERT INTO consulta (nome, data, hora) VALUES (?, ?, ?)';
    await conn.execute(insertQuery, [name, formattedDate, time]);
    
    return `Consulta agendada com sucesso!`;
  } catch (error) {
    console.error('Erro ao agendar consulta:', error);
    return 'Desculpe, ocorreu um erro ao agendar sua consulta. Por favor, tente novamente.';
    } finally {
      if (conn) {
        await conn.release();
      }
    }
  };

//////////////////////////////////////////////////////////////////////////

const cancelarConsulta = async (from, message) => {
  const regex = /([^,]+),\s*(\d{2}\/\d{2}\/\d{4}),\s*(\d{2}:\d{2})/;
  const match = message.match(regex);

  if (!match) {
    return 'Por favor, forneça os dados da consulta que deseja cancelar, no formato: Nome, DD/MM/AAAA, HH:MM.';
  }

  const [_, name, date, time] = match;

  const [day, month, year] = date.split('/');
  const formattedDate = `${year}-${month}-${day}`;

  let conn;
  try {
    console.log('Dados extraídos:', { name, formattedDate, time });
    const conn = await createConnection();
    const deleteQuery = 'DELETE FROM consulta WHERE nome = ? AND data = ? AND hora = ?';
    await conn.execute(deleteQuery, [name, formattedDate, time]);
    
    return `Consulta cancelada com sucesso!`;
  } catch (error) {
    console.error('Erro ao calcelar consulta:', error);
    return 'Desculpe, ocorreu um erro ao cancelar sua consulta. Por favor, tente novamente.';
  }finally {
    if (conn) {
      await conn.release(); 
    }
  }}
  ;

//////////////////////////////////////////////////////////////////////////

const reagendarConsulta = async (from, oldMessage, newMessage) => {
  await cancelarConsulta(from, oldMessage);
  return await agendarConsulta(from, newMessage);
};

//////////////////////////////////////////////////////////////////////////

const feedbackAtendimento = async (from, message) => {
  let conn;
  try {
    conn = await createConnection();
    await conn.execute('INSERT INTO feedback (mensagem) VALUES (?)', [message]);
    return 'Obrigado pelo seu feedback!';
  } catch (error) {
    console.error('Erro ao salvar feedback:', error);
    return 'Desculpe, ocorreu um erro ao salvar seu feedback.';
  } finally {
    if (conn) await conn.release();
  }
};

module.exports = { 
  handleMessage, 
  sendMessage,
  cancelarConsulta,
  reagendarConsulta,
  feedbackAtendimento 
};
