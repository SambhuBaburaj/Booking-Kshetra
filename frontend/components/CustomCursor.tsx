'use client';

import { useEffect, useRef } from 'react';

const CustomCursor = () => {
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if device supports hover
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice) {
      document.body.style.cursor = 'auto';
      return;
    }

    const cursor = cursorRef.current;
    if (!cursor) return;

    let mouseX = 0;
    let mouseY = 0;
    let lastTime = 0;

    // Instant cursor update
    const updateCursor = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      cursor.style.left = `${mouseX}px`;
      cursor.style.top = `${mouseY}px`;
    };

    // Create smooth trail on movement
    const createTrail = () => {
      const now = Date.now();

      if (now - lastTime > 30) { // Create trail every 30ms when moving
        const trail = document.createElement('div');
        trail.className = 'glow-trail';
        trail.style.left = `${mouseX}px`;
        trail.style.top = `${mouseY}px`;
        document.body.appendChild(trail);

        // Remove trail after animation
        setTimeout(() => {
          if (trail.parentNode) {
            trail.parentNode.removeChild(trail);
          }
        }, 800);

        lastTime = now;
      }

      requestAnimationFrame(createTrail);
    };

    // Show/hide cursor
    const showCursor = () => {
      cursor.style.opacity = '1';
    };

    const hideCursor = () => {
      cursor.style.opacity = '0';
    };

    // Hover effects for interactive elements
    const addHoverEffect = () => document.body.classList.add('cursor-hover');
    const removeHoverEffect = () => document.body.classList.remove('cursor-hover');

    // Event listeners
    document.addEventListener('mousemove', updateCursor);
    document.addEventListener('mouseenter', showCursor);
    document.addEventListener('mouseleave', hideCursor);

    // Add hover listeners to interactive elements
    const addHoverListeners = () => {
      const interactiveElements = document.querySelectorAll('button, a, input, textarea, select, [role="button"], [onclick]');

      interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', addHoverEffect);
        el.addEventListener('mouseleave', removeHoverEffect);
      });
    };

    // Initial setup
    addHoverListeners();
    requestAnimationFrame(createTrail);

    // Re-add listeners for dynamically added elements
    const observer = new MutationObserver(addHoverListeners);
    observer.observe(document.body, { childList: true, subtree: true });

    // Cleanup
    return () => {
      document.removeEventListener('mousemove', updateCursor);
      document.removeEventListener('mouseenter', showCursor);
      document.removeEventListener('mouseleave', hideCursor);

      observer.disconnect();
    };
  }, []);

  return <div ref={cursorRef} className="glow-cursor" style={{ opacity: 0 }} />;
};

export default CustomCursor;