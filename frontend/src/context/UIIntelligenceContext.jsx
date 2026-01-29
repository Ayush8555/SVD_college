import React, { createContext, useContext, useCallback, useRef, useState } from 'react';

/**
 * UI Intelligence Context
 * Provides interaction awareness across the app:
 * - Tracks user interaction patterns
 * - Provides intent-aware animation timing
 * - Manages global interaction states
 */

const UIIntelligenceContext = createContext(null);

export const useUIIntelligence = () => {
  const context = useContext(UIIntelligenceContext);
  if (!context) {
    return {
      getAnimationDuration: () => 300,
      isReducedMotion: false,
      interactionSpeed: 'normal',
    };
  }
  return context;
};

export const UIIntelligenceProvider = ({ children }) => {
  const [interactionSpeed, setInteractionSpeed] = useState('normal'); // slow, normal, fast
  const lastInteractionTime = useRef(Date.now());
  const interactionCount = useRef(0);
  const speedCheckInterval = useRef(null);

  // Check for reduced motion preference
  const isReducedMotion = typeof window !== 'undefined' 
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
    : false;

  // Track interactions to detect power users
  const trackInteraction = useCallback(() => {
    const now = Date.now();
    const timeSinceLast = now - lastInteractionTime.current;
    
    interactionCount.current++;
    lastInteractionTime.current = now;

    // If interactions are rapid (< 200ms apart), user is power user
    if (timeSinceLast < 200) {
      setInteractionSpeed('fast');
    } else if (timeSinceLast < 500) {
      setInteractionSpeed('normal');
    } else {
      setInteractionSpeed('slow');
    }

    // Reset after inactivity
    if (speedCheckInterval.current) clearTimeout(speedCheckInterval.current);
    speedCheckInterval.current = setTimeout(() => {
      setInteractionSpeed('normal');
      interactionCount.current = 0;
    }, 2000);
  }, []);

  // Get animation duration based on user speed and reduced motion
  const getAnimationDuration = useCallback((baseDuration = 300) => {
    if (isReducedMotion) return 0;
    
    switch (interactionSpeed) {
      case 'fast': return baseDuration * 0.5;
      case 'slow': return baseDuration * 1.2;
      default: return baseDuration;
    }
  }, [interactionSpeed, isReducedMotion]);

  // Get transition timing
  const getTransitionTiming = useCallback(() => {
    if (isReducedMotion) return 'duration-0';
    
    switch (interactionSpeed) {
      case 'fast': return 'duration-150';
      case 'slow': return 'duration-400';
      default: return 'duration-300';
    }
  }, [interactionSpeed, isReducedMotion]);

  const value = {
    interactionSpeed,
    isReducedMotion,
    trackInteraction,
    getAnimationDuration,
    getTransitionTiming,
  };

  return (
    <UIIntelligenceContext.Provider value={value}>
      <div 
        onClick={trackInteraction} 
        onKeyDown={trackInteraction}
        className="contents"
      >
        {children}
      </div>
    </UIIntelligenceContext.Provider>
  );
};

export default UIIntelligenceProvider;
