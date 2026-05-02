// components/Instruction_Modal.tsx
import React from 'react';

interface InstructionModalProps {
  onClose: () => void;
}

//  use this to generate the tutorial text with words as the list
/*
{Array.from({ length: WORD_LENGTH }).map((_, colIndex) => {
  return (
    <div
      key={`cell-${rowIndex}-${colIndex}`}
      className={`
        min-w-0
        w-[14vw] sm:w-[12vw] md:w-15
        h-[15vw] sm:h-[15vw] md:h-18
        text-4xl sm:text-4xl md:text-3xl
        flex items-center justify-center
        border rounded
        overflow-hidden whitespace-nowrap
        ${getCellClass(rowIndex, colIndex)}
      `}
      style={{ transitionDelay: delay }}
    >
      {getCellContent(rowIndex, colIndex)}
    </div>
  );
})}
*/
type KeyState = 0 | 1 | 2;

const newKeyStates: Record<string, KeyState[]> = {
  "ordet": [2, 2, 2, 2, 2],
  "moste": [0, 1, 0, 0, 1],
  "orgel": [2, 2, 0, 2, 0],
};

const baseTextClass = "space-y-3 text-[var(--text0)]";

const baseLetterClass = "w-[4vw] " +
                "aspect-square " +
                "flex items-center justify-center " +
                "font-bold uppercase " +
                "border rounded transition-colors duration-500";

// Helper function to get Tailwind class based on KeyState
const getColorClass = (state: KeyState) => {
  switch (state) {
    case 2:
      return "bg-[var(--correct)] border-[var(--correct)] text-[var(--text-light)]"; // green
    case 1:
      return "bg-[var(--present)] border-[var(--present)] text-[var(--text-light)]"; // yellow
    case 0:
    default:
      return "bg-[var(--absent)] border-[var(--absent)] text-[var(--text-light)]"; // gray
  }
};

const Instruction_Modal: React.FC<InstructionModalProps> = ({ onClose }) => {
  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur z-50 flex justify-center items-start overflow-auto p-4"
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
      
      <div className="bg-[var(--background)] rounded-lg p-6 max-w-md mx-4 shadow-xl">
        <div className="text-2xl font-bold mb-4 text-[var(--text0)] font-bold">Instruksjoner for spillet.</div>
        
        <div className={baseTextClass}>
          <p>• Skriv inn ett ord med 5 bokstaver og klikk "&gt;".</p>
        </div>
        <div className={baseTextClass}>
          <p>• Bokstavene med grå farge er ikke i dagens ord. Bokstavene med gul farge er i ordet med på feil plass.</p>
        </div>
        <div className="flex justify-center gap-1 mb-4">
          {"moste".split("").map((letter, index) => (
            <div
              key={index}
              className={`
                ${baseLetterClass}
                ${getColorClass(newKeyStates["moste"][index])}
              `}
            >
              {letter}
            </div>
          ))}
        </div>
        <div className={baseTextClass}>
          <p>• Bokstavene med grønn farge er i ordet og på riktig plass.</p>
        </div>
        <div className="flex justify-center gap-1 mb-4">
          {"orgel".split("").map((letter, index) => (
            <div
              key={index}
              className={`
                ${baseLetterClass}
                ${getColorClass(newKeyStates["orgel"][index])}
              `}
            >
              {letter}
            </div>
          ))}
        </div>
        <div className={baseTextClass}>
          <p>• Du har funnet dagens ord når alle bokstavene er grønne.</p>
        </div>
        <div className="flex justify-center gap-1 mb-4">
          {"ordet".split("").map((letter, index) => (
            <div
              key={index}
              className={`
                ${baseLetterClass}
                ${getColorClass(newKeyStates["ordet"][index])}
              `}
            >
              {letter}
            </div>
          ))}
        </div>
        <div className={baseTextClass}>
          <p>• Du kan slette bokstavene på det nåverende forsøket med "&lt;".</p>
        </div>
        <div className={baseTextClass}>
          <p>Lykke til!</p>
        </div>
        
        <div className="mt-6 flex justify-end">
          <button 
            onClick={onClose}
            className="bg-[var(--correct)] text-[var(--text-light)] font-bold px-4 py-2 rounded"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default Instruction_Modal;