// components/game.tsx
import React, { useState, useEffect } from 'react';
import Keyboard from './keyboard';
import Local_storage from './Local_storage';

// Define result states for each letter
type LetterResult = 0 | 1 | 2; // 0: not in word, 1: wrong position, 2: correct position
type KeyState = 'correct' | 'present' | 'absent' | 'unused';

interface GameProps {
  submitWord: (word: string) => Promise<string>;
  todayDate: string;
}

const Game: React.FC<GameProps> = ({ submitWord, todayDate }) => {
  const [currentAttempt, setCurrentAttempt] = useState<string>('');
  const [attempts, setAttempts] = useState<string[]>([]);
  const [results, setResults] = useState<LetterResult[][]>([]);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [keyStates, setKeyStates] = useState<Record<string, KeyState>>({});
  const [error, setError] = useState<string | null>(null);
  
  const MAX_ATTEMPTS = 6;
  const WORD_LENGTH = 6;

  // Load saved game state on component mount
  useEffect(() => {
    // Check if user has played today
    if (Local_storage.played_today(todayDate)) {
      const savedAttempts = Local_storage.get_attempt() || [];
      setAttempts(savedAttempts);
      
      // Load results for each saved attempt
      const loadResults = async () => {
        const newResults: LetterResult[][] = [];
        const newKeyStates: Record<string, KeyState> = {};
        
        for (const attempt of savedAttempts) {
          try {
            const result = await submitWord(attempt);
            const resultArray = result.split('').map(Number) as LetterResult[];
            newResults.push(resultArray);
            
            // Update key states based on results
            updateKeyStates(newKeyStates, attempt, resultArray);
            
            // Check if game is over
            if (resultArray.every(r => r === 2) || savedAttempts.length >= MAX_ATTEMPTS) {
              setIsGameOver(true);
            }
          } catch (error) {
            console.error('Error loading results:', error);
          }
        }
        
        setResults(newResults);
        setKeyStates(newKeyStates);
      };
      
      loadResults();
    }
  }, [todayDate, submitWord]);

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
    
    if (key === 'BACK') {
      // Handle backspace
      setCurrentAttempt(prev => prev.slice(0, -1));
    } else if (key === 'ENTER') {
      // Submit current attempt
      handleSubmit();
    } else if (/^[A-Z]$/.test(key)) {
      // Add letter if within word length
      if (currentAttempt.length < WORD_LENGTH) {
        setCurrentAttempt(prev => prev + key);
      }
    }
  };

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
      const result = await submitWord(currentAttempt);
      const resultArray = result.split('').map(Number) as LetterResult[];
      
      // Update state with new attempt and result
      const newAttempts = [...attempts, currentAttempt];
      const newResults = [...results, resultArray];
      
      setAttempts(newAttempts);
      setResults(newResults);
      setCurrentAttempt('');
      
      // Save attempt to local storage
      Local_storage.save_attempt(currentAttempt);
      
      // Update key states
      const newKeyStates = { ...keyStates };
      updateKeyStates(newKeyStates, currentAttempt, resultArray);
      setKeyStates(newKeyStates);
      
      // Check if game is over (all letters correct or max attempts reached)
      if (resultArray.every(r => r === 2) || newAttempts.length >= MAX_ATTEMPTS) {
        setIsGameOver(true);
        Local_storage.finished_attempt(todayDate);
      }
    } catch (error) {
      console.error('Error submitting word:', error);
      setError('Error submitting word. Please try again.');
    }
  };

  // Get the appropriate CSS class for a letter cell based on result
  const getCellClass = (rowIndex: number, colIndex: number): string => {
    const baseClasses = 'w-12 h-12 border flex items-center justify-center font-bold text-xl uppercase';
    
    // Current row being typed
    if (rowIndex === attempts.length) {
      if (colIndex < currentAttempt.length) {
        return `${baseClasses} border-gray-500 bg-gray-200 text-black`;
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

  return (
    <div className="flex flex-col items-center gap-6">
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
      {error && (
        <div className="text-red-500 font-bold">{error}</div>
      )}
      
      {/* Game over message */}
      {isGameOver && (
        <div className="text-lg font-bold">
          {results.some(result => result.every(r => r === 2))
            ? "Congratulations! You guessed the word!"
            : "Game over. Better luck next time!"}
        </div>
      )}
      
      {/* Keyboard */}
      <Keyboard onKeyPress={handleKeyPress} keyStates={keyStates} />
    </div>
  );
};

export default Game;