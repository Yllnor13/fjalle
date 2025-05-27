// components/Instruction_Modal.tsx
import React from 'react';

const Horizontal_Warning_Modal: React.FC = () => {
  return (
    <div 
      className="bg-[var(--background)] text-[var(--text0)] fixed inset-0 flex items-center justify-center"
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
      
      <div className="bg-[var(--background)] rounded-lg p-6 max-w-md mx-4">
        <div className="text-2xl font-bold mb-4 text-[var(--text0)] font-bold">paralajmërim</div>
        
        <div className="space-y-3 text-[var(--text0)]">
          <p>Ju lutem ktheje telefonin vertikalisht</p>
        </div>
        
      </div>
    </div>
  );
};

export default Horizontal_Warning_Modal;