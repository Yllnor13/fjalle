type WordEntry = {
  date: string;  // e.g. "2027/9/8"
  word: string;  // always 6 letters
};

import wordData from './word_list.json';

export function getDaysWord(dayStr: string): string | null {
  const entry = wordData.find((line) => line.date === dayStr);
  return entry ? entry.word : null;
}

export function checkLetters(data: string, dayStr: string): string {
  if (data.length !== 6) return "";

  const wordOfDay = getDaysWord(dayStr);
  if (!wordOfDay) return "";

  const vals: number[] = [];

  for (let i = 0; i < 6; i++) {
    if (data[i] === wordOfDay[i]) {
      vals.push(2);
    } else if (wordOfDay.includes(data[i])) {
      vals.push(1);
    } else {
      vals.push(0);
    }
  }
  return vals.join("");
}

export function encodeData(data: string, exist: boolean): number {
  let val = 0;
  if (data.length !== 6) return 0; // or throw error

  for (let i = 0; i < 6; i++) {
    const digit = parseInt(data[i], 10);
    if (isNaN(digit) || digit < 0 || digit > 2) {
      throw new Error("Invalid digit in data string, must be 0, 1, or 2");
    }
    val = val * 3 + digit; // base-3 encode
  }

  // shift left by 1 and set last bit according to exist
  val = (val << 1) | (exist ? 1 : 0);
  return val;
}

export function isWordInList(word: string): boolean {
  return wordData.some((entry) => entry.word === word);
}
