import { NextResponse } from 'next/server'

// GET /api/health - простая проверка работы API без БД
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env['NODE_ENV'],
    hasDbUrl: !!process.env['DATABASE_URL'],
  })
}
