import { NextRequest, NextResponse } from 'next/server'
import { SupabaseDatabaseClient } from '@/services/database/SupabaseDatabaseClient'

const databaseClient = new SupabaseDatabaseClient()

// Get user's selected services
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

    const userServices = await databaseClient.getUserServices(userId)
    return NextResponse.json({ userServices })
  } catch (error) {
    console.error('Get user services error:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch user services'
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

// Save user service selection
export async function POST(request: NextRequest) {
  try {
    const { userId, serviceId } = await request.json()
    
    if (!userId || !serviceId) {
      return NextResponse.json(
        { error: 'User ID and Service ID are required' },
        { status: 400 }
      )
    }

    const userService = {
      userId,
      serviceId,
      createdAt: new Date()
    }

    await databaseClient.saveUserService(userService)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Save user service error:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Failed to save user service'
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

// Remove user service selection
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const serviceId = searchParams.get('serviceId')
    
    if (!userId || !serviceId) {
      return NextResponse.json(
        { error: 'User ID and Service ID are required' },
        { status: 400 }
      )
    }

    await databaseClient.removeUserService(userId, serviceId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Remove user service error:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Failed to remove user service'
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}