'use client'

interface WelcomeScreenProps {
  onGetStarted: () => void
}

export function WelcomeScreen({ onGetStarted }: WelcomeScreenProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center px-6 relative overflow-hidden">
      {/* Floating background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-green-400/20 to-blue-500/20 rounded-full blur-3xl"></div>
      </div>
      
      <div className="max-w-sm mx-auto text-center relative z-10">
        {/* Glassmorphic container */}
        <div className="backdrop-blur-sm bg-slate-800/90 rounded-3xl p-8 shadow-2xl border border-slate-700/50 mb-8">
          {/* Modern hero visual */}
          <div className="mb-12">
            <div className="relative w-36 h-36 mx-auto mb-8">
              {/* Glassmorphic background */}
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 via-blue-500 to-purple-600 rounded-full opacity-90 blur-sm"></div>
              <div className="relative w-full h-full bg-gradient-to-br from-emerald-400 via-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-2xl border border-white/30">
                <span className="text-6xl">💰</span>
              </div>
              {/* Floating ring effect */}
              <div className="absolute -inset-2 bg-gradient-to-r from-emerald-400/30 to-purple-600/30 rounded-full blur-lg animate-pulse"></div>
            </div>
            
            {/* Enhanced typography */}
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-200 via-purple-300 to-blue-200 bg-clip-text text-transparent mb-6 leading-tight">
              Organize all your subscriptions in one place
            </h1>
            
            {/* Highlighted stat */}
            <div className="inline-flex items-center bg-gradient-to-r from-blue-900/50 to-purple-900/50 border border-blue-700/50 rounded-2xl px-4 py-2 mb-2">
              <span className="text-2xl mr-2">📱</span>
              <span className="text-sm text-blue-200 font-medium">Track all your services</span>
            </div>
          </div>
        </div>

        {/* Modern CTA button */}
        <button
          onClick={onGetStarted}
          className="group relative w-full bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 hover:from-blue-700 hover:via-purple-700 hover:to-blue-800 text-white text-xl font-semibold py-5 px-8 rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-[1.02] active:scale-[0.98]"
        >
          <span className="relative z-10">Get Started</span>
          {/* Button glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-2xl blur-lg opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
        </button>
        
        {/* Enhanced reassurance */}
        <div className="flex items-center justify-center mt-6 space-x-4 text-sm text-slate-400">
          <div className="flex items-center">
            <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
            <span>2 minutes</span>
          </div>
          <div className="flex items-center">
            <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
            <span>Stay organized</span>
          </div>
          <div className="flex items-center">
            <span className="w-2 h-2 bg-purple-400 rounded-full mr-2"></span>
            <span>100% private</span>
          </div>
        </div>
      </div>
    </div>
  )
}