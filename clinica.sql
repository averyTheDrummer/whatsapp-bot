CREATE DATABASE clinica;

USE clinica;

CREATE TABLE paciente (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100),
  contato VARCHAR(20),
  email VARCHAR(100)
);

CREATE TABLE consulta (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_paciente INT,
  data DATE,
  hora TIME,
  status VARCHAR(20) DEFAULT 'agendada',
  FOREIGN KEY (id_paciente) REFERENCES paciente(id)
);

CREATE TABLE faq (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pergunta TEXT,
  resposta TEXT
);

CREATE TABLE feedback (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_paciente INT,
  mensagem TEXT,
  data_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_paciente) REFERENCES paciente(id)
);
