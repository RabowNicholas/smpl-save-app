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
    const { phone } = await request.json()
    
    if (!phone) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      )
    }

    await authService.sendVerificationCode(phone)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Send verification code error:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Failed to send verification code'
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}