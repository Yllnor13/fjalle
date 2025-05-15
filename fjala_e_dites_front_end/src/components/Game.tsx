// components/game.tsx
import React, { useState, useEffect } from 'react';
import Keyboard from './keyboard';
import Local_storage from './Local_storage';
import {get_Word, send_Word} from '@/lib/api_client';
import local_storage from './Local_storage';

// Define result states for each letter
type LetterResult = 0 | 1 | 2; // 0: not in word, 1: wrong position, 2: correct position
type KeyState = 'correct' | 'present' | 'absent' | 'unused';

const Game: React.FC<{showStatsModal: boolean; setShowStatsModal: (val: boolean) => void}> = ({ showStatsModal, setShowStatsModal })  => {
  const [currentAttempt, setCurrentAttempt] = useState<string>('');
  const [attempts, setAttempts] = useState<string[]>([]);
  const [results, setResults] = useState<LetterResult[][]>([]);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [keyStates, setKeyStates] = useState<Record<string, KeyState>>({});
  const [error, setError] = useState<string | null>(null);
  const [shareMessage, setShareMessage] = useState<string>('');
  const [today_date_ui, set_date] = useState<string>('');
  const [today_word, set_word] = useState<string>('');
  const [won, set_won] = useState<boolean>(false);
  const [lost, set_lost] = useState<boolean>(false);

  const MAX_ATTEMPTS = 6;
  const WORD_LENGTH = 6;

  // Load saved game state on component mount
  useEffect(() => {
    //local_storage.clear_attempts();
    console.log("game loaded");
    // Get the saved game state regardless of whether the game is finished or not
    const savedGameDate = Local_storage.get_game_date();
    const savedAttempts = Local_storage.get_attempt() || {};
    const attemptCount = Object.keys(savedAttempts).length;

    const today_date = get_todays_date();
    set_date(today_date);

    // Only restore the game if it's from today
    if (savedGameDate === today_date && attemptCount > 0) {
      // Convert saved object to arrays for rendering
      let attemptArray: string[] = [];
      const resultsArray: LetterResult[][] = [];
      const newKeyStates: Record<string, KeyState> = {};

      // Process each attempt in the savedAttempts object
      savedAttempts.forEach((word) => {
        const attempt = word.split(" ")
        attemptArray.push(attempt[0])
        const resultDigits = attempt[1].split('').map(Number) as LetterResult[];
        resultsArray.push(resultDigits);

        // Update key states based on this attempt's result
        updateKeyStates(newKeyStates, word.split(" ")[0], resultDigits);
      });

      // Update state with loaded data
      setAttempts(attemptArray);
      setResults(resultsArray);
      setKeyStates(newKeyStates);

      // Check if game is already over
      const lastResult = resultsArray[resultsArray.length - 1];

      set_won(lastResult && lastResult.every(r => r === 2));
      set_lost(attemptArray.length >= MAX_ATTEMPTS);

      if (won || lost) {
        if (won) {
          set_word(attemptArray[attemptArray.length - 1]);
        }
        setIsGameOver(true);
        setShareMessage(generateShareText(attemptArray, resultsArray));
        setTimeout(() => setShowStatsModal(true), 1000);
      }
    } else if (savedGameDate !== today_date) {
      // If it's a new day, clear previous attempts
      Local_storage.clear_attempts();
    }
    
    // Save today's date to track the current game
    Local_storage.save_game_date(today_date);
  }, [today_date_ui]);

  const decodeData = (val: number): { data: string, exist: boolean } => {
    const exist = Boolean(val & 1); // flag to know if the word was in the list
    val = val >> 1;
    let data = '';
    for (let i = 0; i < 6; i++) {
      data = (val % 3).toString() + data;
      val = Math.floor(val / 3);
    }
    return { data, exist };
  };

  // Get today's date in the required format
  const get_todays_date = (): string => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1; // Month is 0-indexed, so add 1
    const day = today.getDate();
    const formattedDate = `${year}/${month}/${day}`;
    console.log(formattedDate); // Output: 2025/4/17
    return formattedDate;
  };

  // Submit current attempt
  const handle_submit = async () => {
    // Validate input length
    if (currentAttempt.length !== WORD_LENGTH) {
      setError(`Word must be ${WORD_LENGTH} letters long`);
      return;
    }
    
    if (attempts.length >= MAX_ATTEMPTS) {
      return;
    }
    
    try {
      // Submit word to backend via parent component
      const res = await send_Word.send_Data(currentAttempt, get_todays_date());
      const responseValue = parseInt(res.data);
      const response = decodeData(responseValue);
      if (response.data.split('').every((d: string) => d === '2')) {
        setIsGameOver(true);
      }
      // Check if the word is not in the word list (server returns exists: false)
      if (!response.exist) { //(!response.exists && !isHardmode)
        setError(`"${currentAttempt}" is not in the word list`);
        return; // Don't process this as an attempt
      }
      
      const resultArray = response.data.split('').map(Number) as LetterResult[];
      
      // Update state with new attempt and result
      const newAttempts = [...attempts, currentAttempt];
      const newResults = [...results, resultArray];
      
      setAttempts(newAttempts);
      setResults(newResults);
      setCurrentAttempt('');
      
      // Save attempt to local storage with its result
      Local_storage.save_attempt(currentAttempt, response.data);
      
      // Update key states
      const newKeyStates = { ...keyStates };
      updateKeyStates(newKeyStates, currentAttempt, resultArray);
      setKeyStates(newKeyStates);
      
      // Check if game is over (all letters correct or max attempts reached)
      const isWin = resultArray.every(r => r === 2);
      const isLoss = newAttempts.length >= MAX_ATTEMPTS && !isWin;
      
      if (isWin || isLoss) {
        handleGameOver(isWin, newAttempts, newResults);
      }
    } catch (error) {
      console.error('Error submitting word:', error);
      setError('Error submitting word. Please try again.');
    }
  };

  // Update key states based on results
  const updateKeyStates = (
    currentKeyStates: Record<string, KeyState>,
    word: string,
    result: LetterResult[]
  ) => {
    for (let i = 0; i < word.length; i++) {
      const letter = word[i].toUpperCase();
      const currentState = currentKeyStates[letter];
      
      if (result[i] === 2) {
        // Letter is in correct position
        currentKeyStates[letter] = 'correct';
      } else if (result[i] === 1 && currentState !== 'correct') {
        // Letter exists but in wrong position, don't override 'correct' state
        currentKeyStates[letter] = 'present';
      } else if (result[i] === 0 && !currentState) {
        // Letter not in word, only set if not already set
        currentKeyStates[letter] = 'absent';
      }
    }
    
    return currentKeyStates;
  };

  // Handle key press from keyboard component
  const handleKeyPress = (key: string) => {
    if (isGameOver) return;
    setError(null);
    
    if (key === 'BACK' || key === '<') {
      // Handle backspace
      setCurrentAttempt(prev => prev.slice(0, -1));
    } else if (key === 'ENTER' || key === '>') {
      // Submit current attempt
      handle_submit();
    } else if (/^[A-ZÇË]$/.test(key)) {
      // Add letter if within word length
      if (currentAttempt.length < WORD_LENGTH) {
        setCurrentAttempt(prev => prev + key);
      }
    }
  };

  // Generate share text with emojis based on results
  const generateShareText = (attemptArray = attempts, resultsArray = results): string => {
    let shareText = `Fjala e dites ${today_date_ui} ${attemptArray.length}/${MAX_ATTEMPTS}\n\n`;
    
    // Create emoji grid based on results
    resultsArray.forEach(row => {
      let rowText = '';
      row.forEach(cell => {
        if (cell === 2) {
          rowText += '🟩'; // correct position
        } else if (cell === 1) {
          rowText += '🟨'; // wrong position
        } else {
          rowText += '⬜'; // not in word
        }
      });
      shareText += rowText + '\n';
    });
    
    return shareText;
  };

  // Handle game completion
  const handleGameOver = (won: boolean, finalAttempts = attempts, finalResults = results) => { 
    if (Local_storage.get_record_bool(today_date_ui)) {
      // Stats already recorded, just show the modal
      setShowStatsModal(true);
      return;
    }
    
    setIsGameOver(true);
    Local_storage.finished_attempt(today_date_ui);
    Local_storage.add_record_bool(today_date_ui);

    // Update statistics
    if (won) {
      Local_storage.add_win();
      Local_storage.save_cur_streak();
      Local_storage.save_win_round(finalAttempts.length);
    } else {
      Local_storage.add_loss();
      Local_storage.remove_cur_streak();
    }
    
    // Generate share text with the final state
    const message = generateShareText(finalAttempts, finalResults);
    setShareMessage(message);
    
    // Show stats modal
    setShowStatsModal(true);
  };

  // Copy results to clipboard
  const copyToClipboard = () => {
    try{
      navigator.clipboard.writeText(shareMessage)
      //"U kopijue me suksese"
    }
    catch(err){
      console.error(err)
    }
  };

  // Calculate win percentage
  const calculateWinPercentage = (): number => {
    const wins = Local_storage.get_wins();
    const losses = Local_storage.get_losses();
    const total = wins + losses;
    
    if (total === 0) return 0;
    return Math.round((wins / total) * 100);
  };

  // Get the appropriate CSS class for a letter cell based on result
  const getCellClass = (rowIndex: number, colIndex: number): string => {
    const baseClasses = 'rounded w-16 h-16 border flex items-center justify-center font-bold text-xl uppercase';
    
    // Current row being typed
    if (rowIndex === attempts.length) {
      if (colIndex < currentAttempt.length) {
        return `${baseClasses} text-[var(--text0)] border-[var(--cell-border-typing)] bg-[var(--cell-bg-typing)] text-[var(--cell-text-typing)]`;
      }
      return `${baseClasses} border-[var(--absent)]`;
    }
    
    // Completed rows with results
    if (rowIndex < attempts.length && results[rowIndex]) {
      const result = results[rowIndex][colIndex];
      if (result === 2) {
        return `${baseClasses} border-[var(--correct)] bg-[var(--correct)] text-[var(--text-light)]`;
      } else if (result === 1) {
        return `${baseClasses} border-[var(--present)] bg-[var(--present)] text-[var(--text-light)]`;
      } else {
        return `${baseClasses} border-[var(--absent)] bg-[var(--absent)] text-[var(--text-light)]`;
      }
    }
    
    // Future rows (not yet active)
    return `${baseClasses} border-[var(--border)] bg-[var(--background)] text-[var(--text1)]`;
  };

  // Get the letter to display in a cell
  const getCellContent = (rowIndex: number, colIndex: number): string => {
    if (rowIndex < attempts.length) {
      return attempts[rowIndex][colIndex] || '';
    }
    
    if (rowIndex === attempts.length && colIndex < currentAttempt.length) {
      return currentAttempt[colIndex];
    }
    
    return '';
  };

  // Function to clear error after a timeout
  const clearErrorAfterDelay = (timeout = 2000) => {
    setTimeout(() => {
      setError(null);
    }, timeout);
  };

  // Set up auto-clearing of error messages
  useEffect(() => {
    if (error) {
      clearErrorAfterDelay();
    }
  }, [error]);

  return ( //use border "border-red-300" to get borders on everyting
    <div className="flex flex-col items-center gap-[2vh] ">
      {/* Word grid */}
      {/* Responsive width container */}
      <div className="max-w-[80vw] max-h-[50vh] overflow-auto">
        <div className="grid grid-rows-6 gap-[0.5vh]">
          {Array.from({ length: MAX_ATTEMPTS }).map((_, rowIndex) => (
            <div
              key={`row-${rowIndex}`}
              className="grid grid-cols-6 gap-[0.3vw]"
            >
              {Array.from({ length: WORD_LENGTH }).map((_, colIndex) => {
                const delay = `${colIndex * 0.2}s`;
                return (
                  <div
                    key={`cell-${rowIndex}-${colIndex}`}
                    className={`
                      max-w-[13vw]
                      max-h-[7vh]
                      aspect-square
                      text-xl
                      flex items-center justify-center
                      border rounded
                      transition-colors duration-500
                      ${getCellClass(rowIndex, colIndex)}
                    `}
                    style={{ transitionDelay: delay }}
                  >
                    {getCellContent(rowIndex, colIndex)}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      
      {/* Error message */}
      <div className="relative">
        {error && (
          <div className="absolute top-[-60px] left-0 right-0 mx-auto w-fit z-10 animate-fadeIn">
            <div className={`text-center font-bold py-2 px-4 rounded-md shadow-lg border ${
              error === 'Results copied to clipboard!' 
                ? 'text-green-700 bg-green-50 border-green-300' 
                : 'text-red-700 bg-red-50 border-red-300'
            }`}>
              {error}
            </div>
          </div>
        )}
      </div>
    {/* Stats Modal */}
    {showStatsModal && (
      <div
        className="text-[var(--text0)] fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
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

            {won && (
              <p className="mt-2">
                Fjala e sotme ishte: <span className="font-bold uppercase">{today_word}</span>
              </p>
            )}
            {lost && (
              <p className="mt-2">
                Nuk i a dole? pyesni miqtë tuaj!
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
                        <span className="text-xs text-[var(--text-light)] font-bold">{count}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Share section */}
          {isGameOver && (
            <div className="mb-4">
            <h3 className="text-lg font-bold mb-2 text-center">Shpërndaje</h3>
            <pre className="bg-[var(--background)] p-2 rounded mb-2 text-sm overflow-x-auto">
              {shareMessage}
            </pre>
            <button 
              onClick={copyToClipboard}
              className="w-full py-2 bg-[var(--correct)] text-[var(--text-light)] font-bold rounded hover:bg-[var(--correct-hover)] transition"
            >
              Kopjo rezultatet
            </button>
          </div>
          )}
          {/* Close button */}
          <button 
            onClick={() => setShowStatsModal(false)}
            className="w-full py-2 text-[var(--text-0)] font-bold rounded"
          >
            Mbylle
          </button>
        </div>
      </div>
    )}
    {/* Keyboard */}
      <Keyboard onKeyPress={handleKeyPress} keyStates={keyStates} />
    </div>
  );
};

export default Game;