import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { Request, Response, NextFunction } from 'express';
import mysql from 'mysql2/promise';
import Joi from 'joi';

const app = express();
const PORT = process.env.PORT || 3001;

interface CustomError extends Error {
  status?: number;
}

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Configuración de MySQL
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'ecommerce_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Middleware de logging
app.use((req: Request, res: Response, next: NextFunction) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Esquema de validación Joi
const productSchema = Joi.object({
    name: Joi.string().min(3).max(100).required(),
    description: Joi.string().min(10).max(500).required(),
    price: Joi.number().positive().precision(2).required(),
    stock: Joi.number().integer().min(0).required()
});

// Rutas de la API
app.get('/api/products', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const [rows] = await pool.query('SELECT * FROM products');
        res.json(rows);
    } catch (err) {
        next(err);
    }
});

app.get('/api/products/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
        if (Array.isArray(rows) && rows.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json(rows[0]);
    } catch (err) {
        next(err);
    }
});

app.post('/api/products', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { error, value } = productSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        // Obtener imagen de API externa (Lorem Picsum)
        const imageResponse = await fetch('https://picsum.photos/400/300');
        const imageUrl = imageResponse.url;

        const [result] = await pool.query(
            'INSERT INTO products (name, description, price, stock, image_url) VALUES (?, ?, ?, ?, ?)',
            [value.name, value.description, value.price, value.stock, imageUrl]
        );

        const newProduct = {
            id: (result as any).insertId,
            ...value,
            image_url: imageUrl
        };

        res.status(201).json(newProduct);
    } catch (err) {
        next(err);
    }
});

app.put('/api/products/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { error, value } = productSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const [result] = await pool.query(
            'UPDATE products SET name = ?, description = ?, price = ?, stock = ? WHERE id = ?',
            [value.name, value.description, value.price, value.stock, req.params.id]
        );

        if ((result as any).affectedRows === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.json({ id: req.params.id, ...value });
    } catch (err) {
        next(err);
    }
});

app.delete('/api/products/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const [result] = await pool.query('DELETE FROM products WHERE id = ?', [req.params.id]);

        if ((result as any).affectedRows === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.status(204).end();
    } catch (err) {
        next(err);
    }
});

// Manejo de errores
app.use((err: CustomError, req: Request, res: Response) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: 'Something went wrong!' });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
