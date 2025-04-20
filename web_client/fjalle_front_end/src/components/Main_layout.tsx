"use client"

// components/mainlayout.tsx
import React, { useState, useEffect } from 'react';
import Game from './Game';
import Local_storage from './Local_storage';
import { send_Word, get_Word } from '@/lib/api_client';

// Function to decode the response from the backend
function decodeData(val: number): { data: string, exist: boolean } {
  const exist = Boolean(val & 1); // last bit
  val = val >> 1;
  let data = '';
  for (let i = 0; i < 6; i++) {
    data = (val % 3).toString() + data;
    val = Math.floor(val / 3);
  }
  return { data, exist };
}

const MainLayout: React.FC = () => {
  const [showHardmodeModal, setShowHardmodeModal] = useState<boolean>(false);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [todayDate, setTodayDate] = useState<string>('');
  const [todayWord, setTodayWord] = useState<string>('');
  const [isHardmode, setIsHardmode] = useState<boolean>(false);

  // Handle selecting hardmode
  const handleSelectHardmode = (isHard: boolean) => {
    Local_storage.hardmode(isHard.toString());
    setIsHardmode(isHard);
    setShowHardmodeModal(false);
  };

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

  // Submit word to the API
  const submitWord = async (word: string): Promise<{ result: string, exists: boolean }> => {
    setTodayDate(get_todays_date())
    try {
      // Use the sendData method instead of calling send_Word directly
      const res = await send_Word.send_Data(word, get_todays_date());
      const responseValue = parseInt(res.data);
      
      // Decode the response
      const decodedResponse = decodeData(responseValue);
      
      // Check if all letters are correct (all '2's)
      if (decodedResponse.data.split('').every((d: string) => d === '2')) {
        setIsGameOver(true);
      }

      return { 
        result: decodedResponse.data,
        exists: decodedResponse.exist
      };
    } catch (error) {
      console.error("Error submitting word:", error);
      throw error;
    }
  };

  return (
    <div className="min-h-screen max-h-screen bg-gray-100 py-8">
        <h1 className="text-3xl font-bold text-center mb-6 text-black">FJALLE</h1>
        
        {/* Game component */}
        <Game 
          submitWord={submitWord}
          todayDate={todayDate}
          todayWord={todayWord}
        />
      </div>
  );
};

export default MainLayout;