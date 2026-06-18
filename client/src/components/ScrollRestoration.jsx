import { useEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

export default function ScrollRestoration() {
  const location = useLocation();
  const navType = useNavigationType();

  useEffect(() => {
    // If it's a POP navigation (meaning the user clicked Back or Forward)
    if (navType === 'POP') {
      const savedPosition = sessionStorage.getItem(`scroll-${location.key}`);
      if (savedPosition) {
        // We use a slight delay to allow asynchronous content (like fetched media) to render
        // before attempting to scroll down.
        setTimeout(() => {
          window.scrollTo(0, parseInt(savedPosition, 10));
        }, 100);
        
        // A second attempt slightly later for heavier data fetching pages
        setTimeout(() => {
          window.scrollTo(0, parseInt(savedPosition, 10));
        }, 500);
      }
    } else {
      // If it's a PUSH or REPLACE navigation (user clicked a new link)
      window.scrollTo(0, 0);
    }
  }, [location.key, navType]);

  useEffect(() => {
    const handleScroll = () => {
      sessionStorage.setItem(`scroll-${location.key}`, window.scrollY.toString());
    };

    // Throttle scroll events slightly for performance
    let timeoutId = null;
    const throttledScroll = () => {
      if (timeoutId) return;
      timeoutId = setTimeout(() => {
        handleScroll();
        timeoutId = null;
      }, 100);
    };

    window.addEventListener('scroll', throttledScroll);
    return () => {
      window.removeEventListener('scroll', throttledScroll);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [location.key]);

  return null;
}
