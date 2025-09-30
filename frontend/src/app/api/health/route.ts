import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    service: 'healthcare-frontend',
    timestamp: new Date().toISOString(),
  });
}
