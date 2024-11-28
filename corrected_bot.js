const twilio = require('twilio');
const session = require('express-session');
const connection = require('./db');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = new twilio(accountSid, authToken);

const sessions = {};


const rescheduleAppointment = async (from, newDate, newTime) => {
  // Simulando a busca da consulta existente para o paciente
  const appointment = await connection.query(
    "SELECT * FROM appointments WHERE phone = ?",
    [from]
  );

  if (!appointment.length) {
    return "Nenhuma consulta existente foi encontrada para reagendamento.";
  }

  // Atualizar a consulta no banco de dados
  await connection.query(
    "UPDATE appointments SET date = ?, time = ? WHERE phone = ?",
    [newDate, newTime, from]
  );

  return `Sua consulta foi reagendada para ${newDate} às ${newTime}.`;
};


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
  
  const scheduleAnswer = /^(.+), (\d{2}\/\d{2}\/\d{4}), (\d{2}:\d{2})$/;
  const match = message.match(scheduleAnswer);

  if (message.includes('1')) {
    return 'Para agendar uma consulta, por favor, forneça seu nome, data e horário desejado no formato: "Nome, DD/MM/AAAA, HH:MM".';
  } else if (match) {
    return await agendarConculta();
  } else if (message.includes('2')) {
    return await cancelarConsulta(from, message)
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

const agendarConculta = () => {
  const [_, name, date, time] = match;

  try {
    const [existingPatient] = await connection.execute(
      'SELECT id FROM paciente WHERE nome = ?',
      [name]
    );
    let patientId;

    if (existingPatient.length > 0) {
      patientId = existingPatient[0].id;
    } else {
      const [result] = await connection.execute(
        'INSERT INTO paciente (nome) VALUES (?)',
        [name]
      );
      patientId = result.insertId;
    }

    const query = 'INSERT INTO consulta (nome, data, horario) VALUES (?, ?, ?)';
    const [result] = connection.execute(query, [name, date, time]);
    const consultaId = result.insertId;
    return `Consulta agendada com sucesso! O ID da sua consulta é: ${consultaId}`;
  } catch (error) {
    console.error('Erro ao agendar consulta:', error);
    return 'Desculpe, ocorreu um erro ao agendar sua consulta. Por favor, tente novamente.';
  }
}

const cancelarConsulta = async (from, body) => {
  const message = body.toLowerCase();

  if (!sessions[from]) {
    sessions[from] = { cancelarConsulta: 0 };
  }C

  const cancelarConsulta = sessions[from].cancelarConsulta;

  if (cancelarConsulta === 0) {
    sessions[from].cancelarConsulta = 1;
    return 'Por favor, informe o ID da consulta que deseja cancelar.';
  }

  if (cancelarConsulta === 1) {
    const appointmentId = parseInt(message, 10);

    if (isNaN(appointmentId)) {
      return 'ID inválido. Por favor, informe um número válido.';
    }

    try {
      const [existingAppointment] = await connection.execute(
        'SELECT id FROM consulta WHERE id = ?',
        [appointmentId]
      );

      if (existingAppointment.length === 0) {
        sessions[from].cancelarConsulta = 0; // Resetar para novo fluxo
        return 'Consulta não encontrada. Verifique o ID e tente novamente.';
      }

      // Excluir a consulta
      await connection.execute(
        'DELETE FROM consulta WHERE id = ?',
        [appointmentId]
      );

      sessions[from].cancelarConsulta = 0; // Resetar para novo fluxo
      return `Consulta com ID ${appointmentId} foi cancelada com sucesso.`;
    } catch (error) {
      console.error('Erro ao cancelar consulta:', error);
      return 'Desculpe, ocorreu um erro ao tentar cancelar a consulta. Por favor, tente novamente.';
    }
  }

  return 'Desculpe, não entendi sua mensagem. Digite "sair" para encerrar.';
};

module.exports = { handleMessage, cancelarConsulta };



module.exports = { handleMessage, sendMessage };
