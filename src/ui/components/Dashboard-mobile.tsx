  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-900 py-4 px-4 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-br from-blue-500/8 to-purple-600/8 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-64 h-64 bg-gradient-to-tr from-purple-500/8 to-blue-600/8 rounded-full blur-3xl"></div>
      </div>
      
      <div className="max-w-md mx-auto relative z-10">
        {/* SMPL Logo */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-black text-yellow-400">
            smpl
          </h1>
        </div>
        
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-200 via-purple-300 to-indigo-200 bg-clip-text text-transparent mb-2">
            Your services
          </h1>
          <p className="text-sm text-indigo-200 font-medium">
            Track and save on your bills
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-slate-800/70 backdrop-blur-sm rounded-2xl p-4 text-center shadow-lg border border-slate-600/40">
            <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-xl text-white">📱</span>
            </div>
            <div className="text-2xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-1">
              {selectedServiceDetails.length}
            </div>
            <div className="text-xs font-semibold text-slate-200">Services Tracked</div>
          </div>
          
          <div className="bg-slate-800/70 backdrop-blur-sm rounded-2xl p-4 text-center shadow-lg border border-slate-600/40">
            <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-xl text-white">✅</span>
            </div>
            <div className="text-2xl font-black bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent mb-1">
              Active
            </div>
            <div className="text-xs font-semibold text-slate-200">Status</div>
          </div>
        </div>

        {/* Services List - Compact */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-slate-200 mb-3 text-center">
            Your Services
          </h2>
          
          <div className="space-y-3">
            {selectedServiceDetails.map((service, index) => {
              const visualData = SERVICE_VISUAL_MAP[service.name] || { icon: '?', brandColor: '#6B7280' }
              const isRemoving = removingServices[service.id]
              
              return (
                <div
                  key={service.id}
                  className={`bg-slate-800/70 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-slate-600/40 transition-all duration-300 ${isRemoving ? 'opacity-50' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-10 h-10 mr-3 rounded-lg flex items-center justify-center shadow-lg">
                        {service.logoUrl && !logoErrors[service.id] ? (
                          <div className="relative w-full h-full bg-white rounded-lg flex items-center justify-center">
                            <img 
                              src={service.logoUrl} 
                              alt={`${service.name} logo`}
                              className="w-6 h-6 object-contain"
                              onError={() => {
                                setLogoErrors(prev => ({ ...prev, [service.id]: true }))
                              }}
                            />
                          </div>
                        ) : (
                          <div 
                            className="w-full h-full rounded-lg flex items-center justify-center text-white font-bold"
                            style={{ backgroundColor: visualData.brandColor }}
                          >
                            <span className={`${visualData.icon.length > 2 ? 'text-xs' : visualData.icon.length > 1 ? 'text-sm' : 'text-base'} font-black`}>
                              {visualData.icon}
                            </span>
                          </div>
                        )}
                      </div>

                      <div>
                        <h3 className="font-semibold text-slate-100 text-sm">
                          {service.name}
                        </h3>
                        <p className="text-xs text-slate-300">Active</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <div className="text-emerald-400 text-lg">✓</div>
                      
                      <button
                        onClick={() => handleRemoveServiceClick(service.id)}
                        disabled={isRemoving}
                        className="w-8 h-8 bg-red-900/30 hover:bg-red-800/50 text-red-400 hover:text-red-300 rounded-lg transition-all duration-200 flex items-center justify-center border border-red-700/30 hover:border-red-600/50 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Remove service"
                      >
                        {isRemoving ? (
                          <LoadingSpinner size="sm" color="white" />
                        ) : (
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Compact Share Section */}
        <div className="mb-6 bg-gradient-to-r from-indigo-900/20 via-purple-900/20 to-indigo-900/20 rounded-2xl p-4 border border-indigo-700/30">
          <div className="text-center">
            <div className="text-2xl mb-2">💰</div>
            <h3 className="text-base font-bold text-indigo-200 mb-2">Help others save money too</h3>
            <p className="text-xs text-slate-200 leading-relaxed mb-3">
              More people = stronger negotiating power = <span className="font-semibold text-purple-200">better rates for everyone!</span>
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: 'Save Money with SMPL',
                  text: 'Get lower rates on your bills by joining our group. Like Costco, but for monthly services. No fees, just savings.',
                  url: window.location.origin
                }).catch(() => {
                  navigator.clipboard.writeText(window.location.origin)
                  setShowShareNotification(true)
                })
              } else {
                navigator.clipboard.writeText(window.location.origin)
                setShowShareNotification(true)
              }
            }}
            className="group relative w-full bg-gradient-to-r from-indigo-600 via-purple-500 to-blue-600 hover:from-indigo-700 hover:via-purple-600 hover:to-blue-700 text-white text-lg font-semibold py-4 rounded-lg transition-all duration-300 shadow-2xl hover:shadow-purple-500/25 transform hover:scale-[1.03] active:scale-[0.97] ring-2 ring-purple-500/20 hover:ring-purple-400/40"
          >
            <span className="relative z-10 flex items-center justify-center">
              <span className="text-xl mr-2">📤</span>
              Share with Friends
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 via-purple-400 to-blue-400 rounded-lg blur-lg opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-500 to-blue-600 rounded-lg blur opacity-20"></div>
          </button>
          
          <button
            onClick={handleAddServices}
            className="group relative w-full bg-slate-700/50 backdrop-blur-sm hover:bg-slate-700/70 text-slate-300 hover:text-slate-200 text-base font-medium py-3 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl border border-slate-600/30 transform hover:scale-[1.01] active:scale-[0.99]"
          >
            <span className="flex items-center justify-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add More Services
            </span>
          </button>
        </div>
        
        {/* live.smpl Branding */}
        <div className="mt-6 text-center">
          <p className="text-xs text-slate-500 font-medium">live.smpl</p>
        </div>

        {/* Modals */}
        <ConfirmModal
          isOpen={showRemoveConfirm}
          onClose={() => {
            setShowRemoveConfirm(false)
            setServiceToRemove(null)
          }}
          onConfirm={handleConfirmRemove}
          title="Remove Service"
          message={`Are you sure you want to remove ${selectedServiceDetails.find(s => s.id === serviceToRemove)?.name || 'this service'} from your tracked services?`}
          confirmText="Remove"
          cancelText="Keep It"
          isLoading={serviceToRemove ? removingServices[serviceToRemove] : false}
          type="danger"
        />
        
        <NotificationModal
          isOpen={showShareNotification}
          onClose={() => setShowShareNotification(false)}
          title="Link Copied!"
          message="Share this link to help others save money on their bills too!"
          type="success"
        />
        
        <NotificationModal
          isOpen={showErrorNotification}
          onClose={() => setShowErrorNotification(false)}
          title="Error"
          message={errorMessage}
          type="error"
          autoClose={false}
        />
      </div>
    </div>
  )