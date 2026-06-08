import { useState, useEffect, useRef } from "react";

export function useScrollVisibility(delay = 400) {
  const [isVisible, setIsVisible] = useState(true);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (isVisible) {
        setIsVisible(false);
      }
      
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }
      
      scrollTimeout.current = setTimeout(() => {
        setIsVisible(true);
      }, delay);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }
    };
  }, [isVisible, delay]);

  return isVisible;
}
