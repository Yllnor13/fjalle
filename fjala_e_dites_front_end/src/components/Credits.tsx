import React from 'react';
import Link from 'next/link';

  interface CreditsModalProps {
    onClose: () => void;
  }

  type InfoLinkProps = {
    label: string;
    value: string;
    href: string;
    external?: boolean;
  };

  const InfoLink = ({ label, value, href, external = false }: InfoLinkProps) => (
  <div className="flex justify-between w-full gap-4">
    <span className="font-bold whitespace-nowrap">{label}:</span>
    {external ? (
      <a
        href={href}
        className="text-blue-500 underline text-right"
        target="_blank"
        rel="noopener noreferrer"
      >
        {value}
      </a>
    ) : (
      <Link href={href} className="text-blue-500 underline text-right">
        {value}
      </Link>
    )}
  </div>
);

  const InfoField = ({ label, value }: { label: string; value: string }) => (
    <div className="flex justify-between w-full gap-[3vw]">
      <span className="font-bold whitespace-nowrap">{label}:</span>
      <span>{value}</span>
    </div>
  )



  const Credits_Modal: React.FC<CreditsModalProps> = ({ onClose }) => {
    return (
      <div 
        className="fixed inset-0 bg-black/70 backdrop-blur z-50 flex justify-center items-center overflow-auto p-4"
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
        
        <div className="bg-[var(--background)] text-[var(--text0)] rounded-lg p-6 max-w-md mx-4 shadow-xl">
          <div className="space-y-2 w-full max-w-md">
            <InfoLink label="AUTHOR" value="Yllnor Rukovci" href="https://www.linkedin.com/in/yllnor-rukovci-2b4860236/" external />
            <InfoLink label="GITHUB" value="Yllnor13" href="https://github.com/Yllnor13" external />
          </div>
          <div className="mt-6 italic flex text-sm justify-center gap-5">
            <a>
              Created with nextjs and flask.
            </a>
            <button 
              onClick={onClose}
              className="text-[var(--text-0)] bg-[var(--correct)] font-bold text-xl not-italic px-4 py-2 rounded"
            >
              CLOSE
            </button>
          </div>
        </div>
      </div>
    );
  };

export default Credits_Modal;