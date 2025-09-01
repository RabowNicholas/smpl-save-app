import { NextRequest, NextResponse } from 'next/server'
import { SupabaseDatabaseClient } from '@/services/database/SupabaseDatabaseClient'

const databaseClient = new SupabaseDatabaseClient()

// Get user's custom services
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const customServices = await databaseClient.getUserCustomServices(userId)
    return NextResponse.json({ customServices })
  } catch (error) {
    console.error('Get custom services error:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch custom services'
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

// Create new custom service
export async function POST(request: NextRequest) {
  try {
    const { userId, name, categoryId } = await request.json()
    
    if (!userId || !name || !categoryId) {
      return NextResponse.json(
        { error: 'User ID, name, and category ID are required' },
        { status: 400 }
      )
    }

    // Validate name length and content
    if (name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Service name cannot be empty' },
        { status: 400 }
      )
    }

    if (name.length > 200) {
      return NextResponse.json(
        { error: 'Service name too long' },
        { status: 400 }
      )
    }

    const customService = await databaseClient.saveCustomService({
      userId,
      name: name.trim(),
      categoryId
    })

    // Also create the user-custom-service relationship
    await databaseClient.saveUserCustomService({
      userId,
      customServiceId: customService.id,
      createdAt: new Date()
    })

    return NextResponse.json({ customService })
  } catch (error) {
    console.error('Create custom service error:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Failed to create custom service'
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

// Remove custom service
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const customServiceId = searchParams.get('customServiceId')
    
    if (!userId || !customServiceId) {
      return NextResponse.json(
        { error: 'User ID and Custom Service ID are required' },
        { status: 400 }
      )
    }

    // Remove the user-custom-service relationship first
    await databaseClient.removeUserCustomService(userId, customServiceId)
    
    // Then remove the custom service itself
    await databaseClient.removeCustomService(userId, customServiceId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Remove custom service error:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Failed to remove custom service'
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}