import React, { useState, useEffect } from 'react';
import starlaImage from '../assets/starla.png';

interface StarlaProps {
  isSpeaking?: boolean;
  sentiment?: string;
  isVisible?: boolean;
}

const Starla: React.FC<StarlaProps> = ({ isSpeaking = false, sentiment = 'neutral', isVisible = true }) => {
  const [rotation, setRotation] = useState(0);
  const [isBobbing, setIsBobbing] = useState(false);
  const [pulseIntensity, setPulseIntensity] = useState(1);
  const [glowIntensity, setGlowIntensity] = useState(0.5);
  const [eyeBlink, setEyeBlink] = useState(false);
  const [isVisibleState, setIsVisibleState] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    if (!isVisible) {
      const timer = setTimeout(() => setIsVisibleState(false), 300);
      return () => clearTimeout(timer);
    } else {
      setIsVisibleState(true);
    }
  }, [isVisible]);

  // Rotation animation
  useEffect(() => {
    if (!isVisibleState) return;
    
    const intervalId = setInterval(() => {
      setRotation(prev => prev + (isSpeaking ? 1.5 : 0.5));
    }, 50);
    
    return () => clearInterval(intervalId);
  }, [isSpeaking, isVisibleState]);

  // Bobbing animation
  useEffect(() => {
    if (!isVisibleState) return;
    
    const bobInterval = setInterval(() => {
      setIsBobbing(prev => !prev);
    }, isSpeaking ? 400 : 800);
    
    return () => clearInterval(bobInterval);
  }, [isSpeaking, isVisibleState]);

  // Eye blinking
  useEffect(() => {
    if (!isVisibleState) return;
    
    const blinkInterval = setInterval(() => {
      setEyeBlink(true);
      setTimeout(() => setEyeBlink(false), 100);
    }, isSpeaking ? 2000 : 4000);
    
    return () => clearInterval(blinkInterval);
  }, [isSpeaking, isVisibleState]);

  // Pulse and glow
  useEffect(() => {
    if (!isVisibleState) return;
    
    if (isSpeaking) {
      const pulseInterval = setInterval(() => {
        setPulseIntensity(prev => prev === 1 ? 1.05 : 1);
        setGlowIntensity(prev => prev === 0.5 ? 1 : 0.5);
      }, 300);
      return () => clearInterval(pulseInterval);
    } else {
      const idleInterval = setInterval(() => {
        setGlowIntensity(prev => prev === 0.5 ? 0.6 : 0.5);
      }, 2000);
      return () => clearInterval(idleInterval);
    }
  }, [isSpeaking, isVisibleState]);

  const getStarColor = () => {
    switch(sentiment) {
      case 'positive': return '#fbbf24';
      case 'negative': return '#f43f5e';
      default: return '#f59e0b';
    }
  };

  if (!isVisibleState) return null;

  return (
    <div className="relative flex flex-col items-center transition-all duration-300 transform hover:scale-105 group">
      {/* Background Glow Aura */}
      <div 
        className="absolute rounded-full transition-all duration-500"
        style={{
          background: `radial-gradient(circle, ${getStarColor()}40 0%, transparent 70%)`,
          width: '250%',
          height: '250%',
          left: '-75%',
          top: '-75%',
          opacity: glowIntensity * 0.5,
        }}
      />

      {/* Floating Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-float"
            style={{
              width: `${Math.random() * 2 + 1}px`,
              height: `${Math.random() * 2 + 1}px`,
              background: getStarColor(),
              opacity: 0.2 + Math.random() * 0.3,
              top: `${Math.random() * 100 - 20}%`,
              left: `${Math.random() * 100 - 20}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      <div className={`relative transition-all duration-300 ${isBobbing ? 'translate-y-1' : '-translate-y-0'}`}>
        
        {/* Main Image */}
        <div 
          className="relative"
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: 'transform 0.05s linear'
          }}
        >
          {/* Outer Glow Ring */}
          <div 
            className="absolute inset-0 rounded-full blur-xl transition-all duration-300"
            style={{
              background: `radial-gradient(circle, ${getStarColor()} 0%, transparent 70%)`,
              opacity: glowIntensity * 0.4,
              transform: 'scale(1.15)'
            }}
          />

          {/* Image */}
          <div
            style={{
              transform: `scale(${pulseIntensity})`,
              transition: 'transform 0.15s ease-in-out'
            }}
          >
            <img
              src={starlaImage}
              alt="Starla"
              className={`w-40 h-40 object-contain relative z-10 transition-all duration-300 ${!imageLoaded ? 'opacity-0' : 'opacity-100'}`}
              onLoad={() => setImageLoaded(true)}
              style={{
                filter: `drop-shadow(0 0 ${12 * glowIntensity}px ${getStarColor()})`
              }}
            />
            
            {/* Loading placeholder */}
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-40 h-40 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full animate-pulse flex items-center justify-center">
                  <span className="text-4xl text-white">⭐</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Status message */}
        {isSpeaking && (
          <div className="mt-4 text-sm text-yellow-400 animate-pulse flex items-center justify-center gap-1">
            <span>✨</span>
            Twinkling...
            <span>⭐</span>
          </div>
        )}
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          25% { transform: translateY(-6px) translateX(3px); }
          75% { transform: translateY(6px) translateX(-3px); }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Starla;