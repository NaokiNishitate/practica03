import mysql from 'mysql2/promise';

interface MySQLResult {
  affectedRows: number;
  insertId: number;
}

// Configuración de la conexión a MySQL
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'ecommerce_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Función para ejecutar consultas
export async function query<T>(
  sql: string, 
  params?: (string | number | boolean | null)[]
): Promise<T[]> {
  const [rows] = await pool.query<T[]>(sql, params);
  return Array.isArray(rows) ? rows : [];
}

// Inicializar la base de datos (tabla products)
export async function initDB() {
    try {
        await query<MySQLResult>(`
      CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        stock INT NOT NULL,
        image_url VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
        console.log('Database initialized');
    } catch (error) {
        console.error('Error initializing database:', error);
    }
}

// Llamar a initDB al importar este módulo
initDB();
