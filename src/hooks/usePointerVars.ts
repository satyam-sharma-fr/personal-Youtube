"use client";

import { useEffect, useCallback, RefObject } from "react";

interface UsePointerVarsOptions {
  /** Whether tracking is enabled (respects reduced motion) */
  enabled?: boolean;
  /** Smoothing factor for interpolation (0-1, higher = snappier) */
  smoothing?: number;
}

/**
 * Hook that tracks pointer position relative to an element and sets CSS variables.
 * Sets --mx and --my as percentage values (e.g., "45%", "62%") for use in gradients.
 * Also sets --px and --py as pixel values from center for transforms.
 */
export function usePointerVars(
  ref: RefObject<HTMLElement | null>,
  options: UsePointerVarsOptions = {}
) {
  const { enabled = true, smoothing = 0.15 } = options;

  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      if (!ref.current || !enabled) return;

      const rect = ref.current.getBoundingClientRect();
      
      // Calculate position as percentage
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      
      // Calculate position from center in pixels
      const centerX = e.clientX - rect.left - rect.width / 2;
      const centerY = e.clientY - rect.top - rect.height / 2;

      // Clamp percentages to bounds with a bit of overflow for edge effects
      const clampedX = Math.max(-10, Math.min(110, x));
      const clampedY = Math.max(-10, Math.min(110, y));

      ref.current.style.setProperty("--mx", `${clampedX}%`);
      ref.current.style.setProperty("--my", `${clampedY}%`);
      ref.current.style.setProperty("--px", `${centerX}px`);
      ref.current.style.setProperty("--py", `${centerY}px`);
    },
    [ref, enabled]
  );

  const handlePointerLeave = useCallback(() => {
    if (!ref.current) return;
    
    // Reset to center on leave
    ref.current.style.setProperty("--mx", "50%");
    ref.current.style.setProperty("--my", "50%");
    ref.current.style.setProperty("--px", "0px");
    ref.current.style.setProperty("--py", "0px");
  }, [ref]);

  useEffect(() => {
    const element = ref.current;
    if (!element || !enabled) return;

    // Initialize to center
    element.style.setProperty("--mx", "50%");
    element.style.setProperty("--my", "50%");
    element.style.setProperty("--px", "0px");
    element.style.setProperty("--py", "0px");

    element.addEventListener("pointermove", handlePointerMove);
    element.addEventListener("pointerleave", handlePointerLeave);

    return () => {
      element.removeEventListener("pointermove", handlePointerMove);
      element.removeEventListener("pointerleave", handlePointerLeave);
    };
  }, [ref, enabled, handlePointerMove, handlePointerLeave]);
}

/**
 * Simplified hook for 3D tilt effect based on pointer position.
 * Sets --tilt-x and --tilt-y CSS variables for use with rotateX/rotateY.
 */
export function useTiltVars(
  ref: RefObject<HTMLElement | null>,
  options: { enabled?: boolean; maxTilt?: number } = {}
) {
  const { enabled = true, maxTilt = 10 } = options;

  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      if (!ref.current || !enabled) return;

      const rect = ref.current.getBoundingClientRect();
      
      // Calculate position from center (-1 to 1)
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;

      // Apply tilt (inverted for natural feel)
      const tiltX = -y * maxTilt;
      const tiltY = x * maxTilt;

      ref.current.style.setProperty("--tilt-x", `${tiltX}deg`);
      ref.current.style.setProperty("--tilt-y", `${tiltY}deg`);
    },
    [ref, enabled, maxTilt]
  );

  const handlePointerLeave = useCallback(() => {
    if (!ref.current) return;
    ref.current.style.setProperty("--tilt-x", "0deg");
    ref.current.style.setProperty("--tilt-y", "0deg");
  }, [ref]);

  useEffect(() => {
    const element = ref.current;
    if (!element || !enabled) return;

    element.style.setProperty("--tilt-x", "0deg");
    element.style.setProperty("--tilt-y", "0deg");

    element.addEventListener("pointermove", handlePointerMove);
    element.addEventListener("pointerleave", handlePointerLeave);

    return () => {
      element.removeEventListener("pointermove", handlePointerMove);
      element.removeEventListener("pointerleave", handlePointerLeave);
    };
  }, [ref, enabled, handlePointerMove, handlePointerLeave]);
}

