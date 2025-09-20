
'use client';

import { useState, useEffect } from 'react';

export const useAudio = (url: string): [boolean, () => void] => {
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);

  const toggle = () => setPlaying(!playing);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const audioInstance = new Audio(url);
      setAudio(audioInstance);
    }
  }, [url]);

  useEffect(() => {
    if (audio) {
      playing ? audio.play().catch(error => console.error("Audio play failed:", error)) : audio.pause();
    }
  }, [playing, audio]);

  useEffect(() => {
    if (audio) {
      const handleEnded = () => setPlaying(false);
      audio.addEventListener('ended', handleEnded);
      return () => {
        audio.removeEventListener('ended', handleEnded);
      };
    }
  }, [audio]);

  const playToggle = () => {
    if (audio) {
        if (playing) {
            audio.pause();
            audio.currentTime = 0; // Rewind to the start
        }
        setPlaying(true); // This will trigger the play effect
    }
  };


  return [playing, playToggle];
};
