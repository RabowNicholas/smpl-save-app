'use client'

interface WelcomeScreenProps {
  onGetStarted: () => void
}

export function WelcomeScreen({ onGetStarted }: WelcomeScreenProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-900 flex items-center justify-center px-6 relative overflow-hidden">
      {/* Sage floating background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-500/10 to-purple-600/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-500/10 to-blue-600/10 rounded-full blur-3xl"></div>
        {/* Additional contemplative lighting */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-indigo-600/5 via-purple-500/8 to-indigo-600/5 rounded-full blur-3xl"></div>
      </div>
      
      <div className="max-w-sm mx-auto text-center relative z-10">
        {/* Sage glassmorphic container */}
        <div className="backdrop-blur-sm bg-slate-900/95 rounded-2xl p-8 shadow-2xl border border-indigo-900/30 mb-8 ring-1 ring-purple-500/20">
          {/* Modern hero visual */}
          <div className="mb-12">
            <div className="relative w-36 h-36 mx-auto mb-8">
              {/* SMPL Logo Container - Sage colors */}
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-500 to-blue-600 rounded-full opacity-90 blur-sm"></div>
              <div className="relative w-full h-full bg-gradient-to-br from-indigo-600 via-purple-500 to-blue-600 rounded-full flex items-center justify-center shadow-2xl border border-purple-200/40">
                <div className="text-center">
                  <div className="text-4xl font-black text-white mb-1">SMPL</div>
                  <div className="text-xs text-white/80 font-medium">LIVE</div>
                </div>
              </div>
              {/* Floating ring effect - Sage pulse */}
              <div className="absolute -inset-2 bg-gradient-to-r from-indigo-400/30 to-purple-600/30 rounded-full blur-lg animate-pulse"></div>
            </div>
            
            {/* Sage Community Messaging */}
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-200 via-purple-300 to-indigo-200 bg-clip-text text-transparent mb-4 leading-tight">
              Discover clarity in your financial choices
            </h1>
            
            <h2 className="text-xl sm:text-2xl font-semibold text-purple-100 mb-6">
              Grow wise together
            </h2>
            
            {/* Collective Wisdom Message - Sage approach */}
            <div className="bg-gradient-to-r from-indigo-950/60 to-slate-900/80 border border-indigo-800/40 rounded-lg p-4 mb-2 ring-1 ring-purple-600/20">
              <div className="flex items-start space-x-3">
                <div className="text-2xl">🔮</div>
                <div className="text-left">
                  <p className="text-sm text-indigo-100 font-medium mb-2">
                    <span className="font-bold text-purple-200">Together we transform understanding</span> into meaningful change.
                  </p>
                  <p className="text-sm text-purple-200 font-bold">
                    <span className="text-indigo-200">Join our wisdom journey.</span> Transform together.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Primary Wisdom CTA - Sage styling */}
        <button
          onClick={onGetStarted}
          className="group relative w-full bg-gradient-to-r from-indigo-600 via-purple-500 to-blue-600 hover:from-indigo-700 hover:via-purple-600 hover:to-blue-700 text-white text-xl font-semibold py-6 px-8 rounded-lg transition-all duration-300 shadow-2xl hover:shadow-purple-500/25 transform hover:scale-[1.03] active:scale-[0.97] ring-2 ring-purple-500/20 hover:ring-purple-400/40"
        >
          <span className="relative z-10 flex items-center justify-center">
            ✨ Begin Journey
            <svg className="w-6 h-6 ml-3 transition-transform group-hover:translate-x-1 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </span>
          {/* Wisdom glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 via-purple-400 to-blue-400 rounded-lg blur-lg opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-500 to-blue-600 rounded-lg blur opacity-20"></div>
        </button>
        
        {/* Wisdom Values - Sage approach */}
        <div className="flex flex-wrap items-center justify-center mt-6 gap-4 text-sm font-medium">
          <div className="flex items-center">
            <span className="w-2 h-2 bg-indigo-400 rounded-full mr-2 animate-pulse"></span>
            <span className="text-indigo-200">Collective wisdom</span>
          </div>
          <div className="flex items-center">
            <span className="w-2 h-2 bg-purple-400 rounded-full mr-2 animate-pulse"></span>
            <span className="text-purple-200">Mindful choices</span>
          </div>
          <div className="flex items-center">
            <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></span>
            <span className="text-blue-300">Transform together</span>
          </div>
        </div>
        
        {/* SMPL Live Branding */}
        <div className="mt-6 text-center">
          <p className="text-xs text-slate-400 font-medium">live.smpl</p>
        </div>
      </div>
    </div>
  )
}