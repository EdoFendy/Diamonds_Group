// components/VideoSection.js
import React from 'react';
import ReactPlayer from 'react-player';
import { GradientText } from '../layout/GradientText'; // Assicurati che il percorso sia corretto

function VideoSection() {
  return (
    <section className="relative py-2">
      <div className="relative z-10 container mx-auto px-3">
        {/* Titolo Sezione */}
        <h2 className="text-4xl font-bold text-center mb-8">
          <GradientText>Scopri il Nostro Video</GradientText>
        </h2>
        <p className="text-center text-gray-300 mb-16">
          Guarda il nostro video introduttivo per saperne di più su U-WIN Network e le nostre soluzioni innovative.
        </p>

        {/* Video Player Responsivo */}
        <div className="flex justify-center mb-16">
          <div className="w-full max-w-6xl relative pb-[56.25%]"> {/* 16:9 Aspect Ratio */}
            <ReactPlayer
              url="https://youtu.be/BAxBYds1dpU?si=yhSXQhcvArvTfLU-" // Inserisci qui l'URL del tuo video
              controls
              width="100%"
              height="90%"
              className="absolute top-0 left-0 rounded-lg shadow-lg"
            />
          </div>
        </div>

      </div>
    </section>
  );
}

export { VideoSection };
