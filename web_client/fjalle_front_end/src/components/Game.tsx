// components/game.tsx
import React, { useState, useEffect } from 'react';
import Keyboard from './keyboard';
import Local_storage from './Local_storage';
import { send_Word, get_Word } from '@/lib/api_client';
import local_storage from './Local_storage';

// Define result states for each letter
type LetterResult = 0 | 1 | 2; // 0: not in word, 1: wrong position, 2: correct position
type KeyState = 'correct' | 'present' | 'absent' | 'unused';

interface GameProps {
  submitWord: (word: string) => Promise<{ result: string, exists: boolean }>;
  todayDate: string;
  //isHardmode: boolean;
  todayWord: string;
}

const Game: React.FC<GameProps> = ({ submitWord, todayDate, todayWord }) => {
  const [currentAttempt, setCurrentAttempt] = useState<string>('');
  const [attempts, setAttempts] = useState<string[]>([]);
  const [results, setResults] = useState<LetterResult[][]>([]);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [keyStates, setKeyStates] = useState<Record<string, KeyState>>({});
  const [error, setError] = useState<string | null>(null);
  const [showStatsModal, setShowStatsModal] = useState<boolean>(false);
  const [shareMessage, setShareMessage] = useState<string>('');
  
  const MAX_ATTEMPTS = 6;
  const WORD_LENGTH = 6;

  // Get today's date in the required format
  const get_todays_date = (): string => {
    console.log("main loaded");
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1; // Month is 0-indexed, so add 1
    const day = today.getDate();
    const formattedDate = `${year}/${month}/${day}`;
    console.log(formattedDate); // Output: 2025/4/17
    return formattedDate;
  };

  // Load saved game state on component mount
  useEffect(() => {
    console.log("game loaded");
    // Get the saved game state regardless of whether the game is finished or not
    const savedGameDate = Local_storage.get_game_date();
    const savedAttempts = Local_storage.get_attempt() || {};
    const attemptCount = Object.keys(savedAttempts).length;

    todayDate = get_todays_date();
    // Only restore the game if it's from today
    if (savedGameDate === todayDate && attemptCount > 0) {
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
      const isFinished = Local_storage.played_today(todayDate);
      const lastResult = resultsArray[resultsArray.length - 1];
      
      if (
        isFinished || 
        (lastResult && lastResult.every(r => r === 2)) || 
        attemptArray.length >= MAX_ATTEMPTS
      ) {
        setIsGameOver(true);
        // Generate share message here for loaded game state
        setShareMessage(generateShareText(attemptArray, resultsArray));
        // Show stats modal if the game was already over when loading
        setTimeout(() => setShowStatsModal(true), 1000);
      }
    } else if (savedGameDate !== todayDate) {
      // If it's a new day, clear previous attempts
      Local_storage.clear_attempts();
    }
    
    // Save today's date to track the current game
    Local_storage.save_game_date(todayDate);
  }, [todayDate]);

  // Submit current attempt
  const handleSubmit = async () => {
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
      const response = await submitWord(currentAttempt);
      
      // Check if the word is not in the word list (server returns exists: false)
      if (!response.exists) { //(!response.exists && !isHardmode)
        setError(`"${currentAttempt}" is not in the word list`);
        return; // Don't process this as an attempt
      }
      
      const resultArray = response.result.split('').map(Number) as LetterResult[];
      
      // Update state with new attempt and result
      const newAttempts = [...attempts, currentAttempt];
      const newResults = [...results, resultArray];
      
      setAttempts(newAttempts);
      setResults(newResults);
      setCurrentAttempt('');
      
      // Save attempt to local storage with its result
      Local_storage.save_attempt(currentAttempt, response.result);
      
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
      handleSubmit();
    } else if (/^[A-ZÇË]$/.test(key)) {
      // Add letter if within word length
      if (currentAttempt.length < WORD_LENGTH) {
        setCurrentAttempt(prev => prev + key);
      }
    }
  };

  // Generate share text with emojis based on results
  const generateShareText = (attemptArray = attempts, resultsArray = results): string => {
    let shareText = `Fjalle ${todayDate} ${attemptArray.length}/${MAX_ATTEMPTS}\n\n`;
    
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
    if (Local_storage.get_record_bool(todayDate)) {
      // Stats already recorded, just show the modal
      setShowStatsModal(true);
      return;
    }
    
    setIsGameOver(true);
    Local_storage.finished_attempt(todayDate);
    Local_storage.add_record_bool(todayDate);

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
    const baseClasses = 'w-14 h-14 border flex items-center justify-center font-bold text-xl uppercase';
    
    // Current row being typed
    if (rowIndex === attempts.length) {
      if (colIndex < currentAttempt.length) {
        return `${baseClasses} text-black border-[var(--cell-border-typing)] bg-[var(--cell-bg-typing)] text-[var(--cell-text-typing)]`;
      }
      return `${baseClasses} border-gray-300`;
    }
    
    // Completed rows with results
    if (rowIndex < attempts.length && results[rowIndex]) {
      const result = results[rowIndex][colIndex];
      if (result === 2) {
        return `${baseClasses} border-green-500 bg-green-500 text-white`;
      } else if (result === 1) {
        return `${baseClasses} border-yellow-500 bg-yellow-500 text-white`;
      } else {
        return `${baseClasses} border-gray-700 bg-gray-700 text-white`;
      }
    }
    
    // Future rows (not yet active)
    return `${baseClasses} border-gray-200 bg-gray-100 text-gray-400`;
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

  return (
    <div className="flex flex-col items-center gap-6 px-2 md:px-4">
      {/* Word grid */}
      <div className="grid grid-rows-6 gap-1">
        {Array.from({ length: MAX_ATTEMPTS }).map((_, rowIndex) => (
          <div key={`row-${rowIndex}`} className="grid grid-cols-6 gap-1">
            {Array.from({ length: WORD_LENGTH }).map((_, colIndex) => (
              <div
                key={`cell-${rowIndex}-${colIndex}`}
                className={getCellClass(rowIndex, colIndex)}
              >
                {getCellContent(rowIndex, colIndex)}
              </div>
            ))}
          </div>
        ))}
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
      
      {/* Simple game over message (when modal is not shown) */}
      {isGameOver && !showStatsModal && (
        <div className="text-lg font-bold">
          {results.some(result => result.every(r => r === 2))
            ? "Congratulations! You guessed the word!"
            : "Game over. Better luck next time!"}
        </div>
      )}
      
      {/* Stats Modal */}
      {showStatsModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-80 md:w-96 max-w-full max-h-[90vh] overflow-auto">
            <h2 className="text-2xl font-bold mb-4 text-center">Game Statistics</h2>
            
            {/* Game result */}
            <div className="mb-4 text-center">
              <p className="text-xl font-bold">
                {results.some(result => result.every(r => r === 2))
                  ? "You won!"
                  : "Better luck next time!"}
              </p>

              {isGameOver && todayWord && (
                <p className="mt-2">
                  Today's word was: <span className="font-bold uppercase">{todayWord}</span>
                </p>
              )}
            </div>
            
            {/* Statistics grid */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="text-center">
                <div className="text-3xl font-bold">{Local_storage.get_wins() + Local_storage.get_losses()}</div>
                <div className="text-sm">Played</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">{calculateWinPercentage()}%</div>
                <div className="text-sm">Win %</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">{Local_storage.get_cur_streak()}</div>
                <div className="text-sm">Current Streak</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">{Local_storage.get_max_streak()}</div>
                <div className="text-sm">Max Streak</div>
              </div>
            </div>
            
            {/* Guess Distribution */}
            <div className="mb-6">
              <h3 className="text-lg font-bold mb-2 text-center">Guess Distribution</h3>
              <div className="space-y-1">
                {Array.from({ length: MAX_ATTEMPTS }).map((_, i) => {
                  const count = Local_storage.get_win_rounds(i + 1);
                  const total = Local_storage.get_wins();
                  const percentage = total > 0 ? (count / total) * 100 : 0;
                  
                  return (
                    <div key={`dist-${i}`} className="flex items-center">
                      <div className="w-4 text-right mr-2">{i + 1}</div>
                      <div className="flex-1 h-6 bg-gray-200 rounded">
                        <div 
                          className={`h-full rounded flex items-center justify-end pr-2 ${
                            attempts.length === i + 1 && results[i]?.every(r => r === 2)
                              ? 'bg-green-500' 
                              : 'bg-gray-500'
                          }`}
                          style={{ width: `${Math.max(percentage, 8)}%` }}
                        >
                          <span className="text-white text-xs font-bold">{count}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Share section */}
            <div className="mb-4">
              <h3 className="text-lg font-bold mb-2 text-center">Share</h3>
              <pre className="bg-gray-100 p-2 rounded mb-2 text-sm overflow-x-auto">
                {shareMessage}
              </pre>
              <button 
                onClick={copyToClipboard}
                className="w-full py-2 bg-green-500 text-white font-bold rounded hover:bg-green-600 transition"
              >
                Copy to Clipboard
              </button>
            </div>
            
            {/* Close button */}
            <button 
              onClick={() => setShowStatsModal(false)}
              className="w-full py-2 bg-gray-200 text-gray-800 font-bold rounded hover:bg-gray-300 transition"
            >
              Close
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