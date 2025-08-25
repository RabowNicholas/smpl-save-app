'use client'

interface WelcomeScreenProps {
  onGetStarted: () => void
}

export function WelcomeScreen({ onGetStarted }: WelcomeScreenProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-red-950 to-black flex items-center justify-center px-6 relative overflow-hidden">
      {/* Floating background elements - Rebel theme */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-red-500/15 to-orange-600/15 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-orange-500/15 to-red-600/15 rounded-full blur-3xl"></div>
        {/* Additional dramatic lighting */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-red-600/5 via-orange-500/10 to-red-600/5 rounded-full blur-3xl"></div>
      </div>
      
      <div className="max-w-sm mx-auto text-center relative z-10">
        {/* Rebel glassmorphic container */}
        <div className="backdrop-blur-sm bg-slate-900/95 rounded-2xl p-8 shadow-2xl border border-red-900/30 mb-8 ring-1 ring-red-500/20">
          {/* Modern hero visual */}
          <div className="mb-12">
            <div className="relative w-36 h-36 mx-auto mb-8">
              {/* SMPL Logo Container - Rebel colors */}
              <div className="absolute inset-0 bg-gradient-to-br from-red-600 via-orange-500 to-red-700 rounded-full opacity-90 blur-sm"></div>
              <div className="relative w-full h-full bg-gradient-to-br from-red-600 via-orange-500 to-red-700 rounded-full flex items-center justify-center shadow-2xl border border-orange-200/40">
                <div className="text-center">
                  <div className="text-4xl font-black text-white mb-1">SMPL</div>
                  <div className="text-xs text-white/80 font-medium">LIVE</div>
                </div>
              </div>
              {/* Floating ring effect - Rebel pulse */}
              <div className="absolute -inset-2 bg-gradient-to-r from-red-400/30 to-orange-600/30 rounded-full blur-lg animate-pulse"></div>
            </div>
            
            {/* Rebel Community Messaging */}
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-orange-200 via-red-300 to-orange-200 bg-clip-text text-transparent mb-4 leading-tight">
              Group discounts on insurance, internet, phones & more
            </h1>
            
            <h2 className="text-xl sm:text-2xl font-semibold text-orange-100 mb-6">
              Fight back together
            </h2>
            
            {/* Community Power Message - Balanced approach */}
            <div className="bg-gradient-to-r from-red-950/60 to-slate-900/80 border border-red-800/40 rounded-lg p-4 mb-2 ring-1 ring-red-600/20">
              <div className="flex items-start space-x-3">
                <div className="text-2xl">🤝</div>
                <div className="text-left">
                  <p className="text-sm text-red-100 font-medium mb-2">
                    <span className="font-bold text-orange-200">Together we have power</span> companies can't ignore.
                  </p>
                  <p className="text-sm text-orange-200 font-bold">
                    <span className="text-red-200">Join our community.</span> Save more together.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Primary Community CTA - Balanced styling */}
        <button
          onClick={onGetStarted}
          className="group relative w-full bg-gradient-to-r from-red-600 via-orange-500 to-red-700 hover:from-red-700 hover:via-orange-600 hover:to-red-800 text-white text-xl font-bold py-6 px-8 rounded-lg transition-all duration-300 shadow-2xl hover:shadow-red-500/25 transform hover:scale-[1.03] active:scale-[0.97] ring-2 ring-orange-500/20 hover:ring-orange-400/40"
        >
          <span className="relative z-10 flex items-center justify-center">
            🚀 GET STARTED
            <svg className="w-6 h-6 ml-3 transition-transform group-hover:translate-x-1 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </span>
          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-red-400 via-orange-400 to-red-500 rounded-lg blur-lg opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-red-600 via-orange-500 to-red-700 rounded-lg blur opacity-20"></div>
        </button>
        
        {/* Community Values - Balanced approach */}
        <div className="flex flex-wrap items-center justify-center mt-6 gap-4 text-sm font-medium">
          <div className="flex items-center">
            <span className="w-2 h-2 bg-red-400 rounded-full mr-2 animate-pulse"></span>
            <span className="text-red-200">Community power</span>
          </div>
          <div className="flex items-center">
            <span className="w-2 h-2 bg-orange-400 rounded-full mr-2 animate-pulse"></span>
            <span className="text-orange-200">Group savings</span>
          </div>
          <div className="flex items-center">
            <span className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse"></span>
            <span className="text-red-300">Save together</span>
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