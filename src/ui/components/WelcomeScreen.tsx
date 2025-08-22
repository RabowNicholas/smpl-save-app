'use client'

interface WelcomeScreenProps {
  onGetStarted: () => void
}

export function WelcomeScreen({ onGetStarted }: WelcomeScreenProps) {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6">
      <div className="max-w-sm mx-auto text-center">
        {/* Simple, beautiful visual */}
        <div className="mb-16">
          <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center shadow-2xl">
            <span className="text-5xl">💰</span>
          </div>
          
          {/* Clear, emotional headline */}
          <h1 className="text-3xl font-semibold text-gray-900 mb-4 leading-tight">
            Save money on subscriptions you forgot about
          </h1>
          
          {/* Minimal supporting text */}
          <p className="text-lg text-gray-600 leading-relaxed">
            Most people save $79/month
          </p>
        </div>

        {/* One obvious action */}
        <button
          onClick={onGetStarted}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white text-lg font-medium py-4 px-8 rounded-2xl transition-colors duration-200 shadow-lg"
        >
          Get Started
        </button>
        
        {/* Minimal reassurance */}
        <p className="text-sm text-gray-400 mt-6">
          Takes 2 minutes • Free • Private
        </p>
      </div>
    </div>
  )
}