import { useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useGsapAnimation } from '../hooks/useGsapAnimation';

const animatePageEntry = (gsap, scope) => {
  gsap.from(scope, {
    autoAlpha: 0,
    y: 8,
    duration: 0.3,
    ease: 'power1.out',
    clearProps: 'opacity,visibility,transform',
  });
};

export const PageTransition = ({ children }) => {
  const scopeRef = useRef(null);
  const { key } = useLocation();

  useGsapAnimation(scopeRef, animatePageEntry, key);

  return <div ref={scopeRef}>{children}</div>;
};