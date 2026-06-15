import { useInView } from 'react-intersection-observer';
import useMediaQuery from '@mui/material/useMediaQuery';

interface UseRevealOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

export const useReveal = (options: UseRevealOptions = {}) => {
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const { ref, inView } = useInView({
    threshold: options.threshold ?? 0.1,
    rootMargin: options.rootMargin ?? '0px 0px -10% 0px',
    triggerOnce: options.triggerOnce ?? true,
  });
  return { ref, isVisible: reducedMotion || inView };
};
