import { NextResponse } from 'next/server';
import { query } from '@/lib/database';
import { productSchema } from '@/lib/validation';
import { logRequest } from '@/lib/middleware';
import type { Product } from '@/types/products';

// GET - Listar todos los productos
export async function GET() {
    try {
        const products = await query<Product>('SELECT * FROM products');
        return NextResponse.json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        return NextResponse.json(
            { error: 'Failed to fetch products' },
            { status: 500 }
        );
    }
}

// POST - Crear nuevo producto
export async function POST(request: Request) {
    try {
        const body = await request.json();
        logRequest(new Request(request.url, { method: 'POST' }));

        // Validación con Joi
        const { error, value } = productSchema.validate(body);
        if (error) {
            return NextResponse.json(
                { error: error.details[0].message },
                { status: 400 }
            );
        }

        // Obtener imagen de API externa (Picsum)
        const imageResponse = await fetch('https://picsum.photos/400/300');
        if (!imageResponse.ok) {
            throw new Error('Failed to fetch image from external API');
        }
        const imageUrl = imageResponse.url;

        // Insertar en la base de datos
        const result = await query<{ insertId: number }>(
            'INSERT INTO products (name, description, price, stock, image_url) VALUES (?, ?, ?, ?, ?)',
            [value.name, value.description, value.price, value.stock, imageUrl]
        );

        // Obtener el producto recién creado
        const [newProduct] = await query<Product>(
            'SELECT * FROM products WHERE id = ?',
            [result[0].insertId]
        );

        return NextResponse.json(newProduct, { status: 201 });
    } catch (error) {
        console.error('Error creating product:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Internal server error' },
            { status: 500 }
        );
    }
}
