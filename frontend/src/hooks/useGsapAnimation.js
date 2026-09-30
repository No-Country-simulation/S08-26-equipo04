import { useEffect } from 'react';
import { gsap } from 'gsap';

export const useGsapAnimation = (scopeRef, animation, dependencyKey) => {
  useEffect(() => {
    const scope = scopeRef.current;
    if (!scope) return undefined;

    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const context = gsap.context(() => animation(gsap, scope), scope);
      return () => context.revert();
    });

    return () => media.revert();
  }, [scopeRef, animation, dependencyKey]);
};