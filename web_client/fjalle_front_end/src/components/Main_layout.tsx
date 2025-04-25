"use client"

// components/mainlayout.tsx
import React, { useState, useEffect } from 'react';
import Game from './Game';
import Instruction_Modal from './Instruction_Modal';
import Horizontal_Warning_Modal from './Horizontal_warning';
import local_storage from './Local_storage';

const MainLayout: React.FC = () => {
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [showInstructionModal, setShowInstructionModal] = useState(false);
  const [showHorizontalWarning, setShowHorizontalWarning] = useState(false);
  const [stats_icon, get_stats_icon] = useState('/icons/stats_icon_d.svg');
  const [kosovalb_icon, get_kosovalb_icon] = useState('/icons/kosovalb_icon_d.svg');
  const [theme_icon, get_theme_icon] = useState('/icons/kosovalb_icon_d.svg');
  const [instruction_icon, get_instruction_icon] = useState('/icons/kosovalb_icon_d.svg');

  // Check if instructions have been seen before
  useEffect(() => {
    const hasSeenInstructions = seen_instruction();
    if (!hasSeenInstructions) {
      setShowInstructionModal(true);
    }
  }, []);

  // Check orientation and show warning for horizontal orientation
  useEffect(() => {
    const checkOrientation = () => {
      // Only show warning on mobile devices
      if (window.innerWidth <= 768) {
        // Check if width is greater than height (landscape/horizontal orientation)
        if (window.innerWidth > window.innerHeight) {
          setShowHorizontalWarning(true);
        } else {
          setShowHorizontalWarning(false);
        }
      }
    };

    // Initial check
    checkOrientation();

    // Add event listener
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    // Cleanup
    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  // LocalStorage functions
  function seen_instruction(): boolean {
    const instruction = localStorage.getItem('instruct');
    return instruction === 'true';
  }

  // Handle closing the instruction modal
  const handleCloseInstructionModal = () => {
    setShowInstructionModal(false);
    local_storage.set_instruction_seen();
  };

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const updateIcon = (e?: MediaQueryListEvent) => {
      const themeStored = localStorage.getItem('theme');
    
      // Use dark mode by default if theme isn't set yet
      const isDark = themeStored === null 
        ? true 
        : themeStored === 'true' 
          ? true 
          : e?.matches ?? mediaQuery.matches;
      get_stats_icon(isDark ? '/icons/dark/stats_icon_d.svg' : '/icons/light/stats_icon_l.svg');
      get_kosovalb_icon(isDark ? '/icons/dark/kosovalb_icon_d.svg' : '/icons/light/kosovalb_icon_l.svg');
      get_theme_icon(isDark ? '/icons/dark/theme_icon_d.svg' : '/icons/light/theme_icon_l.svg');
      get_instruction_icon(isDark ? '/icons/dark/instruction_icon_d.svg' : '/icons/light/instruction_icon_l.svg');
      
    };
  
    updateIcon();
    mediaQuery.addEventListener('change', updateIcon);
  
    return () => mediaQuery.removeEventListener('change', updateIcon);
  }, []);

  return (
    <div className="min-h-screen max-h-screen bg-[var(--background)] flex flex-col">
      {/* Header bar */}
      <div className="w-full bg-[var(--background)] px-4 flex justify-between items-center border-b-2 border-[var(--absent)]">
        {/* Left empty space for balance */}
        <div className="flex items-center space-x-6">
          {/* kosovalb button*/}
          <a
            href="https://www.facebook.com/share/1BiJWjmViJ/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-1 py-1 flex items-center text-sm font-medium text-[var(--text0)] hover:bg-[var-(--unused)] rounded"
          >
            <img src={kosovalb_icon} alt="kosovalb" width="35" height="35" />
          </a>
          {/* theme button */}
          <button
            onClick={() => local_storage.set_theme()}
            className="px-1 py-1 flex items-center text-sm font-medium text-[var(--text0)] hover:bg-[var-(--unused)] rounded"
          >
            <img src={theme_icon} alt="light or dark mode" width="25" height="25" />
          </button>
        </div>
        {/* Center title */}
        <h1 className="text-2xl font-bold text-center text-[var(--text0)]">FJALLE</h1>

        {/* Right aligned buttons */}
        <div className="flex items-center space-x-6">
          {/* instruction button */}
          <button
            onClick={() => setShowInstructionModal(true)}
            className="px-1 py-1 flex items-center text-5xl font-medium text-[var(--text0)] hover:bg-[var-(--unused)] rounded"
          >
            ?
          </button>
          {/*Stats Button*/}
          <button
            onClick={() => setShowStatsModal(true)}
            className="px-1 py-1 flex items-center text-sm font-medium text-[var(--text0)] hover:bg-[var-(--unused)] rounded"
          >
            <img src={stats_icon} alt="Statistics" width="35" height="35" />
          </button>
        </div>
      </div>
      {/* Main content area with padding */}
      <div className="py-3 px-2">
        {/* Game component */}
        <Game showStatsModal={showStatsModal} setShowStatsModal={setShowStatsModal} />
      </div>

      {/* Instruction Modal */}
      {showInstructionModal && (
        <Instruction_Modal onClose={handleCloseInstructionModal} />
      )}

      {/* Horizontal Warning Modal */}
      {showHorizontalWarning && (
        <Horizontal_Warning_Modal />
      )}
    </div>
  );
};

export default MainLayout;