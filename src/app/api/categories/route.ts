import { NextResponse } from 'next/server'
import { SupabaseDatabaseClient } from '@/services/database/SupabaseDatabaseClient'

const databaseClient = new SupabaseDatabaseClient()

export async function GET() {
  try {
    const categories = await databaseClient.getAllCategories()
    return NextResponse.json({ categories })
  } catch (error) {
    console.error('Get categories error:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch categories'
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}