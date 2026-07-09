import { useState, useEffect } from "react";

export function usePageLoading(minimumTime = 1200) {
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const startTime = Date.now();
    let animationFrameId: number;

    const updateProgress = () => {
      const elapsed = Date.now() - startTime;
      
      // Calculate a standard linear progress ratio
      const linearRatio = Math.min(elapsed / minimumTime, 1);
      
      // Apply an elegant ease-out cubic-like progression so it starts fast and slows down near the end
      const easeProgress = 1 - Math.pow(1 - linearRatio, 2.5);
      const calculatedProgress = easeProgress * 100;

      setProgress(Math.round(calculatedProgress));

      if (elapsed < minimumTime) {
        animationFrameId = requestAnimationFrame(updateProgress);
      } else {
        setProgress(100);
        // Start the exit phase
        setIsExiting(true);
        
        // Wait for the exit animation to complete before removing the Preloader
        const exitTimer = setTimeout(() => {
          setIsLoading(false);
        }, 700);
        
        return () => clearTimeout(exitTimer);
      }
    };

    animationFrameId = requestAnimationFrame(updateProgress);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [minimumTime]);

  return {
    progress,
    isLoading,
    isExiting,
  };
}
