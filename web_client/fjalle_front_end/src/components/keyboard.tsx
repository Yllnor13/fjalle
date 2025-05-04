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
    correct: 'tile-correct',
    present: 'tile-present',
    absent: 'tile-absent',
    unused: 'tile-unused'
  };

  return (
    <button
      className={`w-[9vw] md:w-[3vw] h-[8vh] rounded font-bold text-3xl ${stateClasses[state]}`}
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
    ['Q', 'W', 'E', 'R', 'T', 'Z', 'U', 'I', 'O', 'P', 'Ç'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ë'],
    ['>', 'Y', 'X', 'C', 'V', 'B', 'N', 'M', '<']
  ];

  // Handle physical keyboard presses
  React.useEffect(() => {
    console.log("keyboard loaded")
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toUpperCase();
      console.log("Pressed: " + key);
      
      // Handle letters
      if (/^[A-ZÇË]$/.test(key)) {
        console.log("Pressed: " + key);
        onKeyPress(key);
      } 
      // Handle Enter and Backspace
      else if (key === 'ENTER') {
        onKeyPress('ENTER');
      } else if (key === 'BACKSPACE' || key === 'DELETE') {
        onKeyPress('BACK');
      } else {
        onKeyPress(key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    
    // Clean up event listener
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onKeyPress]);

  return (
    <div className="w-full max-w max-h-[30vh]">
      {keyboardRows.map((row, rowIndex) => (
        <div key={rowIndex} className="flex justify-center gap-[0.5vw] md:gap-[0.2vw] my-[0.5vh]">
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