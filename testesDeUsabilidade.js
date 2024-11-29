const assert = require('assert');
const bot = require('./bot.js');

async function simulateConversation(from, messages) {
  let responses = [];
  for (const msg of messages) {
    const response = await bot.handleMessage(from, msg);
    responses.push(response);
  }
  return responses;
}

async function testAgendarConsulta() {
  const from = 'paciente1';
  const messages = ['Olá', '1', 'João Silva, 15/12/2023, 14:00'];
  const responses = await simulateConversation(from, messages);

  assert.strictEqual(
    responses[0],
    'Olá! Bem-vindo à Clínica Melhor Saúde. Como posso ajudá-lo hoje? Selecione uma das opções abaixo:\n\n1. Agendar Consulta\n2. Cancelar Consulta\n3. Reagendar Consulta\n4. Deixar Feedback\n5. Perguntas Frequentes (FAQ)\n\nDigite "sair" para encerrar o atendimento.',
    'Falha ao enviar mensagem de boas-vindas'
  );

  assert.strictEqual(
    responses[1],
    'Por favor, forneça os dados para agendar a consulta no formato: Nome, DD/MM/AAAA, HH:MM',
    'Falha ao solicitar dados para agendamento'
  );

  assert.strictEqual(
    responses[2],
    'Consulta agendada com sucesso!',
    'Falha ao agendar consulta'
  );
}

async function testCancelarConsulta() {
  const from = 'paciente2';
  const messages = ['Olá', '2', 'Maria Souza, 20/12/2023, 10:00'];
  const responses = await simulateConversation(from, messages);

  assert.strictEqual(
    responses[0],
    'Olá! Bem-vindo à Clínica Melhor Saúde. Como posso ajudá-lo hoje? Selecione uma das opções abaixo:\n\n1. Agendar Consulta\n2. Cancelar Consulta\n3. Reagendar Consulta\n4. Deixar Feedback\n5. Perguntas Frequentes (FAQ)\n\nDigite "sair" para encerrar o atendimento.',
    'Falha ao enviar mensagem de boas-vindas'
  );

  assert.strictEqual(
    responses[1],
    'Por favor, forneça os dados da consulta que deseja cancelar no formato: Nome, DD/MM/AAAA, HH:MM',
    'Falha ao solicitar dados para cancelamento'
  );

  assert.strictEqual(
    responses[2],
    'Consulta cancelada com sucesso!',
    'Falha ao cancelar consulta'
  );
}

async function testReagendarConsulta() {
  const from = 'paciente3';
  const messages = ['Olá', '3', 'Carlos Lima, 22/12/2023, 09:00', 'Carlos Lima, 23/12/2023, 11:00'];
  const responses = await simulateConversation(from, messages);

  assert.strictEqual(
    responses[0],
    'Olá! Bem-vindo à Clínica Melhor Saúde. Como posso ajudá-lo hoje? Selecione uma das opções abaixo:\n\n1. Agendar Consulta\n2. Cancelar Consulta\n3. Reagendar Consulta\n4. Deixar Feedback\n5. Perguntas Frequentes (FAQ)\n\nDigite "sair" para encerrar o atendimento.',
    'Falha ao enviar mensagem de boas-vindas'
  );

  assert.strictEqual(
    responses[1],
    'Por favor, forneça os dados da consulta que deseja reagendar no formato: Nome, DD/MM/AAAA, HH:MM',
    'Falha ao solicitar dados para reagendamento'
  );

  assert.strictEqual(
    responses[2],
    'Agora, forneça a nova data e horário no formato: Nome, DD/MM/AAAA, HH:MM',
    'Falha ao solicitar novos dados para reagendamento'
  );

  assert.strictEqual(
    responses[3],
    'Consulta reagendada com sucesso!',
    'Falha ao reagendar consulta'
  );
}

async function testDeixarFeedback() {
  const from = 'paciente4';
  const messages = ['Olá', '4', 'O atendimento foi excelente!'];
  const responses = await simulateConversation(from, messages);

  assert.strictEqual(
    responses[0],
    'Olá! Bem-vindo à Clínica Melhor Saúde. Como posso ajudá-lo hoje? Selecione uma das opções abaixo:\n\n1. Agendar Consulta\n2. Cancelar Consulta\n3. Reagendar Consulta\n4. Deixar Feedback\n5. Perguntas Frequentes (FAQ)\n\nDigite "sair" para encerrar o atendimento.',
    'Falha ao enviar mensagem de boas-vindas'
  );

  assert.strictEqual(
    responses[1],
    'Por favor, nos dê seu feedback sobre a consulta:',
    'Falha ao solicitar feedback'
  );

  assert.strictEqual(
    responses[2],
    'Obrigado pelo seu feedback!',
    'Falha ao receber feedback'
  );
}

async function testPerguntasFrequentes() {
  const from = 'paciente5';
  const messages = ['Olá', '5'];
  const responses = await simulateConversation(from, messages);

  assert.strictEqual(
    responses[0],
    'Olá! Bem-vindo à Clínica Melhor Saúde. Como posso ajudá-lo hoje? Selecione uma das opções abaixo:\n\n1. Agendar Consulta\n2. Cancelar Consulta\n3. Reagendar Consulta\n4. Deixar Feedback\n5. Perguntas Frequentes (FAQ)\n\nDigite "sair" para encerrar o atendimento.',
    'Falha ao enviar mensagem de boas-vindas'
  );

  assert.ok(
    responses[1].includes('Perguntas Frequentes'),
    'Falha ao exibir perguntas frequentes'
  );
}

async function testAtendimentoAutomatico() {
  const from = 'paciente6';
  const messages = ['Olá', 'qual o endereço?'];
  const responses = await simulateConversation(from, messages);

  assert.strictEqual(
    responses[0],
    'Olá! Bem-vindo à Clínica Melhor Saúde. Como posso ajudá-lo hoje? Selecione uma das opções abaixo:\n\n1. Agendar Consulta\n2. Cancelar Consulta\n3. Reagendar Consulta\n4. Deixar Feedback\n5. Perguntas Frequentes (FAQ)\n\nDigite "sair" para encerrar o atendimento.',
    'Falha ao enviar mensagem de boas-vindas'
  );

  assert.ok(
    responses[1].includes('Encontramos uma pergunta similar no nosso FAQ'),
    'Falha ao responder pergunta automaticamente'
  );
}

async function testEncerrarAtendimento() {
  const from = 'paciente7';
  const messages = ['Olá', 'sair'];
  const responses = await simulateConversation(from, messages);

  assert.strictEqual(
    responses[0],
    'Olá! Bem-vindo à Clínica Melhor Saúde. Como posso ajudá-lo hoje? Selecione uma das opções abaixo:\n\n1. Agendar Consulta\n2. Cancelar Consulta\n3. Reagendar Consulta\n4. Deixar Feedback\n5. Perguntas Frequentes (FAQ)\n\nDigite "sair" para encerrar o atendimento.',
    'Falha ao enviar mensagem de boas-vindas'
  );

  assert.strictEqual(
    responses[1],
    'Atendimento encerrado. Para começar novamente, envie qualquer mensagem.',
    'Falha ao encerrar atendimento'
  );
}

async function runTests() {
  await testAgendarConsulta();
  await testCancelarConsulta();
  await testReagendarConsulta();
  await testDeixarFeedback();
  await testPerguntasFrequentes();
  await testAtendimentoAutomatico();
  await testEncerrarAtendimento();

  console.log('Todos os testes de usabilidade foram executados com sucesso.');
}

runTests();