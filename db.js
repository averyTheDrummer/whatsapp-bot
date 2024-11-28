const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '12345',
  database: 'clinica',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const createConnection = async () => {
  try {
    const conn = await pool.getConnection();
    console.log('Conexão obtida do pool MySQL.');
    return conn;
  } catch (error) {
    console.error('Erro ao obter conexão:', error);
    throw error;
  }
};

const closePool = async () => {
  try {
    await pool.end();
    console.log('Pool de conexões fechado.');
  } catch (error) {
    console.error('Erro ao fechar pool:', error);
    throw error;
  }
};

module.exports = {
  createConnection,
  closePool
};