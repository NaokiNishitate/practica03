import { NextRequest } from 'next/server';

export function logRequest(req: NextRequest | Request) {
  const url = req instanceof NextRequest ? req.nextUrl.toString() : req.url;
  const method = req.method;
  
  console.log(`[${new Date().toISOString()}] ${method} ${url}`);
}
