import { NextRequest, NextResponse } from 'next/server'
import { TwilioAuthProvider } from '@/services/auth/TwilioAuthProvider'
import { SupabaseDatabaseClient } from '@/services/database/SupabaseDatabaseClient'
import { AuthService } from '@/core/services/AuthService'

const databaseClient = new SupabaseDatabaseClient()
const twilioProvider = new TwilioAuthProvider(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!,
  process.env.TWILIO_VERIFY_SERVICE_SID!,
  databaseClient
)
const authService = new AuthService(twilioProvider)

export async function POST(request: NextRequest) {
  try {
    const { phone, code } = await request.json()
    
    if (!phone || !code) {
      return NextResponse.json(
        { error: 'Phone number and verification code are required' },
        { status: 400 }
      )
    }

    const user = await authService.verifyCode(phone, code)
    
    return NextResponse.json({ 
      success: true, 
      user: {
        id: user.id,
        phone: user.phone
      }
    })
  } catch (error) {
    console.error('Verify code error:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Failed to verify code'
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}