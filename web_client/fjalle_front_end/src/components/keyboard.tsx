// components/keyboard.tsx
import React from 'react';

// Define the possible states for each key
type KeyState = 'correct' | 'present' | 'absent' | 'unused';

// Props for the Keyboard component
interface KeyboardProps {
  onKeyPress: (key: string) => void;
  keyStates: Record<string, KeyState>;
}

// Props for individual Key component
interface KeyProps {
  value: string;
  onClick: (value: string) => void;
  state: KeyState;
}

// Individual Key component
const Key: React.FC<KeyProps> = ({ value, onClick, state }) => {
  // Map state to appropriate color classes
  const stateClasses = {
    correct: 'bg-green-500 text-white',
    present: 'bg-yellow-500 text-white',
    absent: 'bg-gray-700 text-white',
    unused: 'bg-gray-200 text-black'
  };

  return (
    <button
      className={`rounded font-bold p-2 min-w-[40px] ${stateClasses[state]}`}
      onClick={() => onClick(value)}
    >
      {value}
    </button>
  );
};

// Main Keyboard component
const Keyboard: React.FC<KeyboardProps> = ({ onKeyPress, keyStates }) => {
  // Keyboard layout rows
  const keyboardRows = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['>', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', '<']
  ];

  // Handle physical keyboard presses
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toUpperCase();
      
      // Handle letters
      if (/^[A-Z]$/.test(key)) {
        onKeyPress(key);
      } 
      // Handle Enter and Backspace
      else if (key === 'ENTER') {
        onKeyPress('ENTER');
      } else if (key === 'BACKSPACE' || key === 'DELETE') {
        onKeyPress('BACK');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    
    // Clean up event listener
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onKeyPress]);

  return (
    <div className="w-full max-w-md mx-auto p-2">
      {keyboardRows.map((row, rowIndex) => (
        <div key={rowIndex} className="flex justify-center gap-1 my-1">
          {row.map((key) => (
            <Key
              key={key}
              value={key}
              onClick={onKeyPress}
              state={keyStates[key] || 'unused'}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export default Keyboard;