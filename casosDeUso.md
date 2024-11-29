# Casos de Uso do Bot

## 1. Agendar Consulta

- **Descrição**: O paciente deseja agendar uma nova consulta.
- **Fluxo**:
  1. O paciente seleciona a opção "1" para agendar consulta.
  2. O bot solicita que o paciente forneça os dados no formato: `Nome, DD/MM/AAAA, HH:MM`.
  3. O paciente envia os dados.
  4. O bot verifica a disponibilidade e agenda a consulta.
  5. O bot confirma o agendamento para o paciente.

## 2. Cancelar Consulta

- **Descrição**: O paciente deseja cancelar uma consulta já agendada.
- **Fluxo**:
  1. O paciente seleciona a opção "2" para cancelar consulta.
  2. O bot solicita que o paciente forneça os dados da consulta a ser cancelada no formato: `Nome, DD/MM/AAAA, HH:MM`.
  3. O paciente envia os dados.
  4. O bot procede com o cancelamento.
  5. O bot confirma o cancelamento para o paciente.

## 3. Reagendar Consulta

- **Descrição**: O paciente deseja reagendar uma consulta existente para uma nova data e horário.
- **Fluxo**:
  1. O paciente seleciona a opção "3" para reagendar consulta.
  2. O bot solicita que o paciente forneça os dados da consulta a ser reagendada no formato: `Nome, DD/MM/AAAA, HH:MM`.
  3. O paciente envia os dados da consulta atual.
  4. O bot solicita a nova data e horário desejados.
  5. O paciente envia os novos dados no formato: `Nome, DD/MM/AAAA, HH:MM`.
  6. O bot atualiza a consulta com os novos dados.
  7. O bot confirma o reagendamento para o paciente.

## 4. Deixar Feedback

- **Descrição**: O paciente deseja fornecer feedback sobre o atendimento ou serviço.
- **Fluxo**:
  1. O paciente seleciona a opção "4" para deixar feedback.
  2. O bot solicita que o paciente envie seu feedback.
  3. O paciente envia a mensagem com o feedback.
  4. O bot agradece pelo feedback e armazena a informação no banco de dados.

## 5. Perguntas Frequentes (FAQ)

- **Descrição**: O paciente deseja visualizar as perguntas frequentes.
- **Fluxo**:
  1. O paciente seleciona a opção "5" para acessar o FAQ.
  2. O bot recupera as perguntas frequentes do banco de dados.
  3. O bot envia a lista de FAQs para o paciente.

## 6. Atendimento Automático a Perguntas

- **Descrição**: O paciente faz uma pergunta específica que pode estar no FAQ.
- **Fluxo**:
  1. O paciente envia uma pergunta ao bot.
  2. O bot verifica se a pergunta corresponde a alguma existente no FAQ.
  3. Se encontrar correspondência, o bot envia a resposta correspondente.
  4. Se não encontrar, o bot informa que não compreendeu e procede com o atendimento.

## 7. Encerrar Atendimento

- **Descrição**: O paciente deseja encerrar a sessão de atendimento.
- **Fluxo**:
  1. O paciente digita "sair" ou "encerrar".
  2. O bot encerra a sessão e confirma o encerramento para o paciente.
