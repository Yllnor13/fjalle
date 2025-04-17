"use client"

// components/mainlayout.tsx
import React, { useState, useEffect } from 'react';
import Game from './Game';
import Local_storage from './Local_storage';
import { send_Word, get_Word } from '@/lib/api_client';
import Modal from './Modal';

const MainLayout: React.FC = () => {
  const [showCookieConsent, setShowCookieConsent] = useState<boolean>(false);
  const [showResultModal, setShowResultModal] = useState<boolean>(false);
  const [modalContent, setModalContent] = useState<string>('');
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [todayDate, setTodayDate] = useState<string>('');
  const [todayWord, setTodayWord] = useState<string>('');

  // Get today's date in the required format
  const get_todays_date = (): string => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1; // Month is 0-indexed, so add 1
    const day = today.getDate();
    const formattedDate = `${year}/${month}/${day}`;
    console.log(formattedDate); // Output: 2025/4/14
    return formattedDate;
  };

  // On component mount
  useEffect(() => {
    const date = get_todays_date();
    setTodayDate(date);

    // Check if cookies are accepted
    const cookiesAccepted = Local_storage.get_accept_cookies();
    if (!cookiesAccepted) {
      setShowCookieConsent(true);
    }
    
    // Check if game is already over for today
    if (Local_storage.played_today(date)) {
      const attempts = Local_storage.get_attempt() || [];
      // If they've used all 6 attempts or found the word, fetch the answer
      if (attempts.length >= 6) {
        handleGameOver();
      }
    }
  }, []);

  // Handle accepting cookies
  const handleAcceptCookies = () => {
    Local_storage.accept_cookies();
    setShowCookieConsent(false);
  };

  // Handle declining cookies
  const handleDeclineCookies = () => {
    setShowCookieConsent(false);
    // You might want to show a message that game progress won't be saved
  };

  // Submit word to the API
  const submitWord = async (word: string): Promise<string> => {
    try {
      // Use the sendData method instead of calling send_Word directly
      const res = await send_Word.send_Data(word, todayDate);
        const response = res.data;

        if (response && response.split('').every((d: string) => d === '2')) {
        setIsGameOver(true);
        handleGameOver();
        }

        return response;
    } catch (error) {
      console.error("Error submitting word:", error);
      throw error;
    }
  };

  // Handle game over state
  const handleGameOver = async () => {
    try {
      // Mark game as finished for today
      Local_storage.finished_attempt(todayDate);
      
      // Get today's word from the API - use getData method
      const word = await get_Word.get_Data();
      setTodayWord(word);
      
      // Show modal with today's word
      setModalContent(`Today's word was: ${word.toUpperCase()}`);
      setShowResultModal(true);
    } catch (error) {
      console.error("Error getting today's word:", error);
      setModalContent("Game over! Couldn't retrieve today's word.");
      setShowResultModal(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-center mb-6 text-black">FJALLE</h1>
        
        {/* Game component */}
        <Game 
          submitWord={submitWord}
          todayDate={todayDate}
        />
        
        {/* Cookie consent modal using the Modal component */}
        <Modal 
          isOpen={showCookieConsent} 
          onClose={handleDeclineCookies}
        >
          <div className="text-center">
            <h2 className="text-xl font-bold mb-4">Cookie Consent</h2>
            <p className="mb-6">
              This game uses cookies to save your progress. Do you consent to the use of cookies?
            </p>
            <div className="flex justify-center gap-4">
              <button 
                onClick={handleAcceptCookies}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
              >
                Accept
              </button>
              <button 
                onClick={handleDeclineCookies}
                className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded"
              >
                Decline
              </button>
            </div>
          </div>
        </Modal>
        
        {/* Game result modal */}
        <Modal 
          isOpen={showResultModal} 
          onClose={() => setShowResultModal(false)}
        >
          <div className="text-center">
            <h2 className="text-xl font-bold mb-4">Game Over</h2>
            <p className="text-lg mb-4">{modalContent}</p>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default MainLayout;