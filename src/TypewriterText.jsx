import { useState, useEffect, useReducer } from 'react';

const generateTypoForWord = (word) => {
  if (word.length < 4) return null; // Skip short words
  
  const typoPatterns = [
    // Double letter typos
    (w) => {
      const pos = Math.floor(w.length * 0.4) + Math.floor(Math.random() * Math.floor(w.length * 0.4));
      return {
        typo: w.slice(0, pos) + w[pos] + w.slice(pos),
        backtrackTo: Math.max(2, pos - 1)
      };
    },
    // Wrong letter in middle
    (w) => {
      const pos = Math.floor(w.length * 0.3) + Math.floor(Math.random() * Math.floor(w.length * 0.4));
      const wrongChars = 'qwertyuiopasdfghjklzxcvbnm';
      let wrongChar = wrongChars[Math.floor(Math.random() * wrongChars.length)];
      // Ensure wrong char differs from the original
      const originalChar = w[pos];
      if (wrongChar === originalChar) {
        const alt = wrongChars[Math.floor(Math.random() * wrongChars.length)];
        wrongChar = alt === originalChar ? 'e' : alt;
      }
      return {
        typo: w.slice(0, pos) + wrongChar + w.slice(pos + 1),
        backtrackTo: Math.max(2, pos - 1)
      };
    },
    // Extra letter
    (w) => {
      const pos = Math.floor(w.length * 0.2) + Math.floor(Math.random() * Math.floor(w.length * 0.5));
      const extraChar = w[pos] || 'e';
      return {
        typo: w.slice(0, pos + 1) + extraChar + w.slice(pos + 1),
        backtrackTo: Math.max(2, pos)
      };
    }
  ];
  
  const pattern = typoPatterns[Math.floor(Math.random() * typoPatterns.length)];
  return pattern(word);
};

export function TypewriterText({ 
  texts = ["Developer, Creator, and Digital Enthusiast"],
  typingSpeed = 100,
  deletingSpeed = 60,
  pauseDuration = 3000,
  typoChance = 0.3,
  correctionPause = 800,
  loopSingle = false,
  className = ""
}) {
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const initialTypoState = {
    hasTypo: false,
    isCorrectingTypo: false,
    isWaitingCorrection: false,
    originalWord: '',
    typoWord: '',
    backtrackTo: 0,
    wordStartIndex: 0
  };

  function typoReducer(state, action) {
    switch (action.type) {
      case 'RESET':
        return { ...initialTypoState };
      case 'START_TYPO': {
        const { originalWord, typoWord, backtrackTo, wordStartIndex } = action.payload;
        return {
          hasTypo: true,
          isCorrectingTypo: false,
          isWaitingCorrection: false,
          originalWord,
          typoWord,
          backtrackTo,
          wordStartIndex
        };
      }
      case 'BEGIN_CORRECTION':
        return { ...state, isWaitingCorrection: false, isCorrectingTypo: true };
      case 'WAIT_BEFORE_CORRECT':
        return { ...state, isWaitingCorrection: true };
      case 'FINISH_CORRECTION':
        return { ...initialTypoState };
      default:
        return state;
    }
  }

  const [typoState, dispatchTypo] = useReducer(typoReducer, initialTypoState);

  // Robust word finder: handles multiple spaces, tabs, punctuation, hyphens, apostrophes
  // Returns the word that includes the given position, where startIndex is the
  // index of the first alphanumeric letter of the word (excluding leading punctuation).
  const findWordInText = (text, position) => {
    // Treat only letters/numbers with optional internal '-' or "'" as words
    const wordRegex = /[A-Za-z0-9]+(?:[-'][A-Za-z0-9]+)*/g;
    let match;
    let wordIndex = 0;
    while ((match = wordRegex.exec(text)) !== null) {
      const start = match.index;
      const end = start + match[0].length;
      // Use half-open interval [start, end) to avoid including trailing boundary
      if (position >= start && position < end) {
        return {
          word: match[0],
          startIndex: start,
          endIndex: end,
          wordIndex
        };
      }
      wordIndex++;
    }
    return null;
  };

  const chooseDelay = () => {
    if (isPaused) return pauseDuration;
    if (typoState.isWaitingCorrection) return correctionPause;
    if (typoState.isCorrectingTypo) return deletingSpeed;
    if (isDeleting) return deletingSpeed;
    return typingSpeed;
  };

  useEffect(() => {
    const currentFullText = texts[currentTextIndex];
    
    const timeout = setTimeout(() => {
      if (isPaused) {
        setIsPaused(false);
        setIsDeleting(true);
        return;
      }

      // Transition from waiting to correction phase without extra timers
      if (typoState.isWaitingCorrection && !typoState.isCorrectingTypo) {
        dispatchTypo({ type: 'BEGIN_CORRECTION' });
        return;
      }

      if (typoState.isCorrectingTypo) {
        if (currentText.length > typoState.backtrackTo) {
          setCurrentText(currentText.slice(0, -1));
        } else {
          // Start typing the correct word
          const correctText = currentFullText.slice(0, typoState.backtrackTo);
          const nextChar = currentFullText[typoState.backtrackTo];
          if (nextChar) {
            setCurrentText(correctText + nextChar);
            dispatchTypo({ type: 'FINISH_CORRECTION' });
          }
        }
        return;
      }

      if (isDeleting) {
        if (currentText.length > 0) {
          setCurrentText(currentText.slice(0, -1));
        } else {
          setIsDeleting(false);
          setCurrentTextIndex((prev) => (prev + 1) % texts.length);
          dispatchTypo({ type: 'RESET' });
        }
      } else {
        // If we are in a typo flow, handle it regardless of full-text length
        if (typoState.hasTypo) {
          const posInWord = currentText.length - typoState.wordStartIndex;
          if (posInWord < typoState.typoWord.length) {
            const nextTypoChar = typoState.typoWord[posInWord];
            setCurrentText(currentText + nextTypoChar);
          } else {
            // Finished typing typo; wait, then correct
            dispatchTypo({ type: 'WAIT_BEFORE_CORRECT' });
          }
          return;
        }

        if (currentText.length < currentFullText.length) {
          const nextChar = currentFullText[currentText.length];
          const wordInfo = findWordInText(currentFullText, currentText.length);

          // Check if we should make a typo for this word
          const shouldMakeTypo = wordInfo &&
                               Math.random() < typoChance &&
                               currentText.length === wordInfo.startIndex; // Start of word

          if (shouldMakeTypo) {
            const scenario = generateTypoForWord(wordInfo.word);
            if (scenario) {
              dispatchTypo({
                type: 'START_TYPO',
                payload: {
                  originalWord: wordInfo.word,
                  typoWord: scenario.typo,
                  backtrackTo: wordInfo.startIndex + scenario.backtrackTo,
                  wordStartIndex: wordInfo.startIndex
                }
              });
              setCurrentText(currentText + scenario.typo[0]);
            } else {
              setCurrentText(currentText + nextChar);
            }
          } else {
            setCurrentText(currentText + nextChar);
          }
        } else {
          if (texts.length > 1 || loopSingle) {
            setIsPaused(true);
          }
        }
      }
    }, chooseDelay());

    return () => clearTimeout(timeout);
  }, [currentText, currentTextIndex, isDeleting, isPaused, typoState, texts, typingSpeed, deletingSpeed, pauseDuration, typoChance, correctionPause, loopSingle]);

  return (
    <span className={`${className} inline-block min-h-[2.5rem] sm:min-h-[3rem] md:min-h-[3.5rem]`}>
      <span className="sm:whitespace-nowrap">
        {currentText}
      </span>
      <span className={`animate-cursor-blink ${typoState.hasTypo || typoState.isCorrectingTypo || typoState.isWaitingCorrection ? 'text-red-400' : ''}`}>|</span>
    </span>
  );
}
