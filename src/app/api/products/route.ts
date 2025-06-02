import { NextResponse } from "next/server";
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'ecommerce_db',
});

export async function GET() {
    try {
        const connection = await pool.getConnection();
        const [rows] = await connection.query('SELECT * FROM products');
        connection.release();
        return NextResponse.json(rows);
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to fetch products' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Validación básica
        if (!body.name || !body.description || !body.price || !body.stock) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Obtener imagen de API externa
        const imageResponse = await fetch('https://picsum.photos/400/300');
        const imageUrl = imageResponse.url;

        const connection = await pool.getConnection();
        const [result] = await connection.query(
            'INSERT INTO products (name, description, price, stock, image_url) VALUES (?, ?, ?, ?, ?)',
            [body.name, body.description, body.price, body.stock, imageUrl]
        );

        const newProduct = {
            id: (result as any).insertId,
            ...body,
            image_url: imageUrl
        };

        connection.release();
        return NextResponse.json(newProduct, { status: 201 });
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to create product' },
            { status: 500 }
        );
    }
}
