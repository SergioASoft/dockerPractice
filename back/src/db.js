const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "root",
  database: process.env.DB_NAME || "tasksdb",
  waitForConnections: true,
  connectionLimit: 10,
});

async function initDB() {
  let retries = 10;
  while (retries > 0) {
    try {
      const conn = await pool.getConnection();
      console.log("✅ Conectado a MySQL");
      await conn.query(`
        CREATE TABLE IF NOT EXISTS tasks (
          id INT AUTO_INCREMENT PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          completed BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log("✅ Tabla 'tasks' lista");
      conn.release();
      return;
    } catch (err) {
      retries--;
      console.log(`⏳ Esperando MySQL... reintentos restantes: ${retries}`);
      await new Promise((r) => setTimeout(r, 3000));
    }
  }
  throw new Error("No se pudo conectar a la base de datos");
}

initDB().catch((err) => {
  console.error(err.message);
  process.exit(1);
});

module.exports = pool;