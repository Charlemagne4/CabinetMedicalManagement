import { useState, useEffect, useRef } from "react";

function useIntersactionObserver(options?: IntersectionObserverInit) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const targetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      const entry = entries[0];
      setIsIntersecting(!!entry && entry.isIntersecting);
    }, options);

    if (targetRef.current) {
      observer.observe(targetRef.current);
    }

    return () => observer.disconnect();
  }, [options]);

  return { targetRef, isIntersecting };
}
export default useIntersactionObserver;
