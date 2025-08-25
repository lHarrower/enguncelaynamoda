/**
 * Intersection Observer Hook
 * React Native implementation for lazy loading and visibility detection
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { Dimensions, View } from 'react-native';

interface IntersectionObserverOptions {
  /** Root margin for intersection detection */
  rootMargin?: number;
  /** Threshold for intersection (0-1) */
  threshold?: number;
  /** Only trigger once */
  triggerOnce?: boolean;
  /** Initial visibility state */
  initialInView?: boolean;
  /** Delay before checking intersection */
  delay?: number;
}

interface IntersectionObserverResult {
  /** Reference to attach to the element to observe */
  ref: React.RefObject<View | null>;
  /** Whether the element is currently in view */
  inView: boolean;
  /** Intersection entry with detailed information */
  entry: IntersectionEntry | null;
}

interface IntersectionEntry {
  /** Whether the element is intersecting */
  isIntersecting: boolean;
  /** Intersection ratio (0-1) */
  intersectionRatio: number;
  /** Bounding rectangle of the element */
  boundingClientRect: {
    top: number;
    left: number;
    bottom: number;
    right: number;
    width: number;
    height: number;
  };
  /** Root bounds (screen dimensions) */
  rootBounds: {
    top: number;
    left: number;
    bottom: number;
    right: number;
    width: number;
    height: number;
  };
}

/**
 * Hook for detecting when an element enters/exits the viewport
 * Useful for lazy loading images and infinite scrolling
 */
export const useIntersectionObserver = ({
  rootMargin = 50,
  threshold = 0.1,
  triggerOnce = false,
  initialInView = false,
  delay = 0,
}: IntersectionObserverOptions = {}): IntersectionObserverResult => {
  const ref = useRef<View>(null);
  const [inView, setInView] = useState(initialInView);
  const [entry, setEntry] = useState<IntersectionEntry | null>(null);
  const [hasTriggered, setHasTriggered] = useState(false);

  const checkIntersection = useCallback(() => {
    if (!ref.current || (triggerOnce && hasTriggered)) {
      return;
    }

    const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

    ref.current.measureInWindow((x, y, width, height) => {
      // Calculate intersection
      const elementTop = y;
      const elementBottom = y + height;
      const elementLeft = x;
      const elementRight = x + width;

      // Apply root margin
      const viewportTop = -rootMargin;
      const viewportBottom = screenHeight + rootMargin;
      const viewportLeft = -rootMargin;
      const viewportRight = screenWidth + rootMargin;

      // Check if element is in viewport
      const isIntersecting =
        elementBottom > viewportTop &&
        elementTop < viewportBottom &&
        elementRight > viewportLeft &&
        elementLeft < viewportRight;

      // Calculate intersection ratio
      let intersectionRatio = 0;
      if (isIntersecting) {
        const intersectionTop = Math.max(elementTop, viewportTop);
        const intersectionBottom = Math.min(elementBottom, viewportBottom);
        const intersectionLeft = Math.max(elementLeft, viewportLeft);
        const intersectionRight = Math.min(elementRight, viewportRight);

        const intersectionWidth = Math.max(0, intersectionRight - intersectionLeft);
        const intersectionHeight = Math.max(0, intersectionBottom - intersectionTop);
        const intersectionArea = intersectionWidth * intersectionHeight;
        const elementArea = width * height;

        intersectionRatio = elementArea > 0 ? intersectionArea / elementArea : 0;
      }

      const shouldBeInView = isIntersecting && intersectionRatio >= threshold;

      // Create entry object
      const newEntry: IntersectionEntry = {
        isIntersecting: shouldBeInView,
        intersectionRatio,
        boundingClientRect: {
          top: elementTop,
          left: elementLeft,
          bottom: elementBottom,
          right: elementRight,
          width,
          height,
        },
        rootBounds: {
          top: 0,
          left: 0,
          bottom: screenHeight,
          right: screenWidth,
          width: screenWidth,
          height: screenHeight,
        },
      };

      setEntry(newEntry);

      if (shouldBeInView !== inView) {
        setInView(shouldBeInView);

        if (shouldBeInView && triggerOnce) {
          setHasTriggered(true);
        }
      }
    });
  }, [threshold, rootMargin, triggerOnce, hasTriggered, inView]);

  useEffect(() => {
    if (delay > 0) {
      const timer = setTimeout(checkIntersection, delay);
      return () => clearTimeout(timer);
    } else {
      checkIntersection();
    }
  }, [checkIntersection, delay]);

  // Set up periodic checking for scroll events
  useEffect(() => {
    const interval = setInterval(checkIntersection, 100);
    return () => clearInterval(interval);
  }, [checkIntersection]);

  return { ref, inView, entry };
};

/**
 * Hook for lazy loading images with intersection observer
 */
export const useLazyLoading = ({
  rootMargin = 100,
  threshold = 0.1,
}: Pick<IntersectionObserverOptions, 'rootMargin' | 'threshold'> = {}) => {
  const { ref, inView, entry } = useIntersectionObserver({
    rootMargin,
    threshold,
    triggerOnce: true,
    initialInView: false,
  });

  return {
    ref,
    shouldLoad: inView,
    entry,
  };
};

/**
 * Hook for infinite scrolling with intersection observer
 */
export const useInfiniteScroll = ({
  onLoadMore,
  hasNextPage = true,
  isLoading = false,
  rootMargin = 200,
}: {
  onLoadMore: () => void;
  hasNextPage?: boolean;
  isLoading?: boolean;
  rootMargin?: number;
}) => {
  const { ref, inView } = useIntersectionObserver({
    rootMargin,
    threshold: 0.1,
    triggerOnce: false,
  });

  useEffect(() => {
    if (inView && hasNextPage && !isLoading) {
      onLoadMore();
    }
  }, [inView, hasNextPage, isLoading, onLoadMore]);

  return { ref, isIntersecting: inView };
};

/**
 * Hook for tracking element visibility for analytics
 */
export const useVisibilityTracking = ({
  onVisible,
  onHidden,
  threshold = 0.5,
  minVisibleTime = 1000,
}: {
  onVisible?: () => void;
  onHidden?: () => void;
  threshold?: number;
  minVisibleTime?: number;
}) => {
  const { ref, inView } = useIntersectionObserver({
    threshold,
    triggerOnce: false,
  });

  const visibleStartTime = useRef<number | null>(null);
  const hasTrackedView = useRef(false);

  useEffect(() => {
    if (inView && !visibleStartTime.current) {
      visibleStartTime.current = Date.now();
      hasTrackedView.current = false;
    } else if (!inView && visibleStartTime.current) {
      const visibleDuration = Date.now() - visibleStartTime.current;

      if (visibleDuration >= minVisibleTime && !hasTrackedView.current) {
        onVisible?.();
        hasTrackedView.current = true;
      }

      onHidden?.();
      visibleStartTime.current = null;
    }
  }, [inView, onVisible, onHidden, minVisibleTime]);

  return { ref, isVisible: inView };
};

export default useIntersectionObserver;
