
'use client';

import { useState, useEffect } from 'react';

export const useAudio = (url: string): [boolean, () => void] => {
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    // Solo se ejecuta en el cliente
    const audioInstance = new Audio(url);
    setAudio(audioInstance);

    const handleEnded = () => setPlaying(false);
    audioInstance.addEventListener('ended', handleEnded);

    // Limpieza al desmontar el componente
    return () => {
      audioInstance.pause();
      audioInstance.removeEventListener('ended', handleEnded);
    };
  }, [url]);

  useEffect(() => {
    if (audio) {
      if (playing) {
        audio.play().catch(error => console.error("Error al reproducir audio:", error));
      } else {
        audio.pause();
      }
    }
  }, [playing, audio]);

  // Esta es la función que se llamará desde fuera
  const playToggle = () => {
    if (audio) {
      // Si ya está sonando, lo detenemos y reiniciamos
      if (playing) {
        audio.pause();
        audio.currentTime = 0;
      }
      // Lo marcamos para que suene (el useEffect se encargará de llamar a play())
      setPlaying(true);
    }
  };

  return [playing, playToggle];
};
