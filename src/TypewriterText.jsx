import { useState, useEffect, useReducer } from 'react';

// Human-like typo generator using QWERTY neighbor keys and common mistakes
const generateTypoForWord = (word) => {
  if (!word || word.length < 4) return null; // Skip short words

  // Build a simple QWERTY grid and derive neighbors for letters only
  const rows = [
    "qwertyuiop",
    "asdfghjkl",
    "zxcvbnm",
  ];

  const posMap = new Map();
  rows.forEach((row, r) => {
    for (let c = 0; c < row.length; c++) {
      posMap.set(row[c], { r, c });
    }
  });

  const neighborsOf = (ch) => {
    const lower = ch.toLowerCase();
    const pos = posMap.get(lower);
    if (!pos) return [];
    const ns = [];
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        const rr = pos.r + dr;
        const cc = pos.c + dc;
        if (rr < 0 || rr >= rows.length) continue;
        if (cc < 0 || cc >= rows[rr].length) continue;
        const n = rows[rr][cc];
        if (/[a-z]/.test(n)) ns.push(n);
      }
    }
    // Preserve original case
    return ns.map((n) => (ch === lower ? n : n.toUpperCase()));
  };

  // Choose an index with a center bias (typos are rarer at extremes)
  const letterIndices = [];
  for (let i = 0; i < word.length; i++) {
    if (/[A-Za-z]/.test(word[i])) letterIndices.push(i);
  }
  if (letterIndices.length === 0) return null;

  const chooseBiasedIndex = () => {
    // Triangular-ish distribution centered by averaging 2 uniforms
    const r = (Math.random() + Math.random()) / 2; // [0,1] with center mass
    const i = Math.floor(r * letterIndices.length);
    return letterIndices[Math.min(i, letterIndices.length - 1)];
  };

  const pos = chooseBiasedIndex();

  // Define candidate typo types with weights
  const hasNeighbors = neighborsOf(word[pos]).length > 0;
  const canTranspose = pos + 1 < word.length && /[A-Za-z]/.test(word[pos + 1]);

  const candidates = [];
  if (hasNeighbors) candidates.push({ type: 'neighborSub', weight: 0.5 });
  if (hasNeighbors) candidates.push({ type: 'neighborInsert', weight: 0.2 });
  if (canTranspose) candidates.push({ type: 'transpose', weight: 0.15 });
  candidates.push({ type: 'duplicate', weight: 0.1 });
  if (word.length >= 6) candidates.push({ type: 'omit', weight: 0.05 });

  if (candidates.length === 0) return null;

  const total = candidates.reduce((s, c) => s + c.weight, 0);
  let pick = Math.random() * total;
  let chosen = candidates[0].type;
  for (const c of candidates) {
    if (pick < c.weight) { chosen = c.type; break; }
    pick -= c.weight;
  }

  const charAt = (i) => word[i];
  const slice = (a, b) => word.slice(a, b);

  switch (chosen) {
    case 'neighborSub': {
      const ns = neighborsOf(charAt(pos));
      if (!ns.length) return null;
      const repl = ns[Math.floor(Math.random() * ns.length)];
      return {
        typo: slice(0, pos) + repl + slice(pos + 1),
        backtrackTo: pos,
      };
    }
    case 'neighborInsert': {
      const ns = neighborsOf(charAt(pos));
      if (!ns.length) return null;
      const ins = ns[Math.floor(Math.random() * ns.length)];
      return {
        typo: slice(0, pos + 1) + ins + slice(pos + 1),
        backtrackTo: pos + 1,
      };
    }
    case 'transpose': {
      // Swap pos and pos+1
      return {
        typo: slice(0, pos) + charAt(pos + 1) + charAt(pos) + slice(pos + 2),
        backtrackTo: pos,
      };
    }
    case 'duplicate': {
      // Double the chosen character
      return {
        typo: slice(0, pos + 1) + charAt(pos) + slice(pos + 1),
        backtrackTo: pos + 1,
      };
    }
    case 'omit': {
      // Skip the chosen character
      return {
        typo: slice(0, pos) + slice(pos + 1),
        backtrackTo: pos,
      };
    }
    default:
      return null;
  }
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
