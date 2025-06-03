import { NextRequest } from 'next/server';

export function logRequest(req: NextRequest) {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
}
