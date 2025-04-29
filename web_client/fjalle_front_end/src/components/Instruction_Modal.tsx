// components/Instruction_Modal.tsx
import React from 'react';

interface InstructionModalProps {
  onClose: () => void;
}

const Instruction_Modal: React.FC<InstructionModalProps> = ({ onClose }) => {
  return (
    <div 
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
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
        <div className="text-2xl font-bold mb-4 text-[var(--text0)] font-bold">Këshilla për lojën</div>
        
        <div className="space-y-3 text-[var(--text0)]">
          <p>Shkruaje një fjalë më gjashtë shkronja dhe kliko "&gt;"</p>
          
          <p>Shkronjat me ngjyrë të gjelbër, janë në vendin e duhur</p>
          
          <p>Shkronjat me ngjyrë të verdhë janë në fjalë por nuk janë në vendin e duhur</p>
          
          <p>Shkronjat me ngjyrë të hirtë nuk janë në fjalë</p>
          
          <p>Mundeni ti shlyeni shkronjat me "&lt;"</p>
          
          <p>Ju uroj fat!</p>
        </div>
        
        <div className="mt-6 flex justify-end">
          <button 
            onClick={onClose}
            className="bg-[var(--correct)] text-[var(--text1)] px-4 py-2 rounded"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default Instruction_Modal;