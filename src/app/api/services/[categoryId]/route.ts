import { NextRequest, NextResponse } from 'next/server'
import { SupabaseDatabaseClient } from '@/services/database/SupabaseDatabaseClient'

const databaseClient = new SupabaseDatabaseClient()

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ categoryId: string }> }
) {
  try {
    const { categoryId } = await params
    
    if (!categoryId) {
      return NextResponse.json(
        { error: 'Category ID is required' },
        { status: 400 }
      )
    }

    const services = await databaseClient.getServicesByCategory(categoryId)
    return NextResponse.json({ services })
  } catch (error) {
    console.error('Get services error:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch services'
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}