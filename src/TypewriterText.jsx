import { useState, useEffect } from 'react';

export function TypewriterText({ 
  texts = ["Developer, Creator, and Digital Enthusiast"],
  typingSpeed = 80,
  deletingSpeed = 50,
  pauseDuration = 2000,
  className = ""
}) {
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const currentFullText = texts[currentTextIndex];
    
    const timeout = setTimeout(() => {
      if (isPaused) {
        setIsPaused(false);
        setIsDeleting(true);
        return;
      }

      if (isDeleting) {
        if (currentText.length > 0) {
          setCurrentText(currentText.slice(0, -1));
        } else {
          setIsDeleting(false);
          setCurrentTextIndex((prev) => (prev + 1) % texts.length);
        }
      } else {
        if (currentText.length < currentFullText.length) {
          setCurrentText(currentFullText.slice(0, currentText.length + 1));
        } else {
          if (texts.length > 1) {
            setIsPaused(true);
          }
        }
      }
    }, isPaused ? pauseDuration : isDeleting ? deletingSpeed : typingSpeed);

    return () => clearTimeout(timeout);
  }, [currentText, currentTextIndex, isDeleting, isPaused, texts, typingSpeed, deletingSpeed, pauseDuration]);

  return (
    <span className={`${className} inline-block min-h-[2.5rem] sm:min-h-[3rem] md:min-h-[3.5rem]`}>
      <span className="sm:whitespace-nowrap">
        {currentText}
      </span>
      <span className="animate-cursor-blink">|</span>
    </span>
  );
}