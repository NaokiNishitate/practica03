import { NextResponse } from 'next/server';
import { query } from '@/lib/database';
import { productSchema } from '@/lib/validation';
import { logRequest } from '@/lib/middleware';
import type { NextRequest } from 'next/server';
import type { Product } from '@/types/products';

// GET - Obtener producto por ID
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        logRequest(request);
        const productId = parseInt(params.id);

        if (isNaN(productId)) {
            return NextResponse.json(
                { error: 'Invalid product ID' },
                { status: 400 }
            );
        }

        const products = await query<Product>(
            'SELECT * FROM products WHERE id = ?',
            [productId]
        );

        if (products.length === 0) {
            return NextResponse.json(
                { error: 'Product not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(products[0]);
    } catch (error) {
        console.error('Error fetching product:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// PUT - Actualizar producto
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        logRequest(request);
        const productId = parseInt(params.id);
        const body = await request.json();

        if (isNaN(productId)) {
            return NextResponse.json(
                { error: 'Invalid product ID' },
                { status: 400 }
            );
        }

        // Validación con Joi
        const { error, value } = productSchema.validate(body);
        if (error) {
            return NextResponse.json(
                { error: error.details[0].message },
                { status: 400 }
            );
        }

        // Verificar si el producto existe
        const existingProducts = await query<Product>(
            'SELECT * FROM products WHERE id = ?',
            [productId]
        );

        if (existingProducts.length === 0) {
            return NextResponse.json(
                { error: 'Product not found' },
                { status: 404 }
            );
        }

        // Actualizar producto
        await query(
            'UPDATE products SET name = ?, description = ?, price = ?, stock = ? WHERE id = ?',
            [value.name, value.description, value.price, value.stock, productId]
        );

        // Obtener el producto actualizado
        const [updatedProduct] = await query<Product>(
            'SELECT * FROM products WHERE id = ?',
            [productId]
        );

        return NextResponse.json(updatedProduct);
    } catch (error) {
        console.error('Error updating product:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// DELETE - Eliminar producto
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        logRequest(request);
        const productId = parseInt(params.id);

        if (isNaN(productId)) {
            return NextResponse.json(
                { error: 'Invalid product ID' },
                { status: 400 }
            );
        }

        // Verificar si el producto existe
        const existingProducts = await query<Product>(
            'SELECT * FROM products WHERE id = ?',
            [productId]
        );

        if (existingProducts.length === 0) {
            return NextResponse.json(
                { error: 'Product not found' },
                { status: 404 }
            );
        }

        // Eliminar producto
        await query(
            'DELETE FROM products WHERE id = ?',
            [productId]
        );

        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error('Error deleting product:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
