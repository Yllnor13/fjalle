const Stats: React.FC<> = () => {
    return (
        {showStatsModal && (
            <div
              className="text-[var(--text0)] fixed inset-0 flex items-center justify-center bg-gray bg-opacity-50 z-50"
              style={{
                animation: "0.3s ease-out forwards modalFadeIn"
              }}
            >
              <style jsx>{`
                @keyframes modalFadeIn {
                  from { opacity: 0; transform: translateY(40px); }
                  to { opacity: 1; transform: translateY(0); }
                }
              `}</style>
              <div className="bg-[var(--background)] p-6 rounded-lg shadow-lg w-80 md:w-96 max-w-full max-h-[90vh] overflow-auto">
                {/* Game result */}
                <div className="mb-4 text-center">
                  <p className="text-xl font-bold">
                    {results.some(result => result.every(r => r === 2))
                      ? "Ju keni fituar!"
                      : "Suksese ne vazhdim!"}
                  </p>
      
                  {isGameOver && today_word && (
                    <p className="mt-2">
                      Fjala e sotme ishte: <span className="font-bold uppercase">{today_word}</span>
                    </p>
                  )}
                </div>
                
                {/* Statistics grid */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold">{Local_storage.get_wins() + Local_storage.get_losses()}</div>
                    <div className="text-sm">Lojë</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold">{calculateWinPercentage()}%</div>
                    <div className="text-sm">Fituar %</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold">{Local_storage.get_cur_streak()}</div>
                    <div className="text-sm">Brezi aktual</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold">{Local_storage.get_max_streak()}</div>
                    <div className="text-sm">Brezi maksimum</div>
                  </div>
                </div>
                
                {/* Guess Distribution */}
                <div className="mb-6">
                  <h3 className="font-bold mb-2 text-center">Shpërndarja e përgjigjeve</h3>
                  <div className="space-y-1">
                    {Array.from({ length: MAX_ATTEMPTS }).map((_, i) => {
                      const count = Local_storage.get_win_rounds(i + 1);
                      const total = Local_storage.get_wins();
                      const percentage = total > 0 ? (count / total) * 100 : 0;
                      
                      return (
                        <div key={`dist-${i}`} className="flex items-center">
                          <div className="w-4 text-right mr-2">{i + 1}</div>
                          <div className="flex-1 h-6 bg-[var(--background)] rounded">
                            <div 
                              className={`h-full rounded flex items-center justify-end pr-2 ${
                                attempts.length === i + 1 && results[i]?.every(r => r === 2)
                                  ? 'bg-green-500' 
                                  : 'bg-[var(--foreground)]'
                              }`}
                              style={{ width: `${Math.max(percentage, 8)}%` }}
                            >
                              <span className="text-xs font-bold">{count}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                {/* Share section */}
                <div className="mb-4">
                  <h3 className="text-lg font-bold mb-2 text-center">Shpërndaje</h3>
                  <pre className="bg-[var(--background)] p-2 rounded mb-2 text-sm overflow-x-auto">
                    {shareMessage}
                  </pre>
                  <button 
                    onClick={copyToClipboard}
                    className="w-full py-2 bg-green-500 text-white font-bold rounded hover:bg-green-600 transition"
                  >
                    Kopijo resultatet
                  </button>
                </div>
                
                {/* Close button */}
                <button 
                  onClick={() => setShowStatsModal(false)}
                  className="w-full py-2 bg-gray-200 text-gray-800 font-bold rounded hover:bg-gray-300 transition"
                >
                  Mbylle
                </button>
              </div>
            </div>
          )}
    )
}