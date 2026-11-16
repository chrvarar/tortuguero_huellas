import { useEffect, useState } from 'react';

const PAW_COUNT = 8;

// Global reactive listener for API/async operations
const listeners = new Set();
let activeCount = 0;
let debounceTimer = null;
let isSplashVisible = false;

function notify() {
  listeners.forEach((listener) => listener(isSplashVisible));
}

export const splashNotifier = {
  startRequest() {
    activeCount += 1;
    if (activeCount === 1) {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        isSplashVisible = true;
        notify();
      }, 180);
    }
  },
  endRequest() {
    activeCount = Math.max(0, activeCount - 1);
    if (activeCount === 0) {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
        debounceTimer = null;
      }
      if (isSplashVisible) {
        setTimeout(() => {
          if (activeCount === 0) {
            isSplashVisible = false;
            notify();
          }
        }, 150);
      }
    }
  },
  show() {
    if (debounceTimer) clearTimeout(debounceTimer);
    isSplashVisible = true;
    notify();
  },
  hide() {
    activeCount = 0;
    if (debounceTimer) clearTimeout(debounceTimer);
    isSplashVisible = false;
    notify();
  },
};

export function useSplash() {
  const [active, setActive] = useState(isSplashVisible);

  useEffect(() => {
    listeners.add(setActive);
    return () => listeners.delete(setActive);
  }, []);

  return active;
}

export function PawCircle({ size = 28, radius = 52, className = '' }) {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % PAW_COUNT);
    }, 1000); // 1.0 second per paw
    return () => clearInterval(timer);
  }, []);

  const boxDimension = radius * 2 + size + 24;

  return (
    <div
      className={`vl-paw-circle ${className}`}
      style={{
        width: `${boxDimension}px`,
        height: `${boxDimension}px`,
        position: 'relative',
      }}
      role="status"
      aria-label="Cargando…"
    >
      <span className="vl-paw-sr-only">Cargando…</span>
      {Array.from({ length: PAW_COUNT }).map((_, index) => {
        const angle = index * (360 / PAW_COUNT);
        const isActive = index === activeStep;
        return (
          <div
            key={index}
            className="vl-paw-slot"
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: `${size}px`,
              height: `${size}px`,
              transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-${radius}px) rotate(90deg)`,
              pointerEvents: 'none',
            }}
          >
            <div
              className={`vl-paw-glyph ${isActive ? 'is-active' : ''}`}
              aria-hidden="true"
            >
              <svg viewBox="0 0 40 40" fill="currentColor">
                <ellipse cx="8" cy="16" rx="4" ry="6" transform="rotate(-26 8 16)" />
                <ellipse cx="16" cy="8" rx="4" ry="6" />
                <ellipse cx="25" cy="8" rx="4" ry="6" />
                <ellipse cx="33" cy="16" rx="4" ry="6" transform="rotate(26 33 16)" />
                <path d="M8 32c0-5 7-15 12-15s12 10 12 15c0 9-8 5-12 5s-12 4-12-5Z" />
              </svg>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function PawSplash({ active, fullScreen = true, className = '' }) {
  const globalActive = useSplash();
  const isVisible = active !== undefined ? active : globalActive;

  if (!isVisible) return null;

  if (!fullScreen) {
    return (
      <div className={`vl-paw-inline-container ${className}`} aria-live="polite" aria-busy="true">
        <PawCircle />
      </div>
    );
  }

  return (
    <div className={`vl-paw-splash ${className}`} aria-live="polite" aria-busy="true">
      <div className="vl-paw-splash-box">
        <PawCircle />
      </div>
    </div>
  );
}
