/**
 * @module hooks/usePolling
 * @description Custom hook that invokes a callback immediately and then on a
 * fixed interval. Pauses polling when the browser tab is hidden (via the
 * Page Visibility API) to reduce unnecessary network traffic.
 *
 * @param {Function} callback - Async or sync function to call on each tick
 * @param {number}   [intervalMs=30000] - Polling interval in milliseconds
 */
import { useEffect, useRef, useCallback } from 'react';

export default function usePolling(callback, intervalMs = 30000) {
  const savedCallback = useRef(callback);
  const intervalRef = useRef(null);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  const tick = useCallback(() => {
    savedCallback.current();
  }, []);

  useEffect(() => {
    tick();

    const startPolling = () => {
      intervalRef.current = setInterval(tick, intervalMs);
    };

    const stopPolling = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    const handleVisibility = () => {
      if (document.hidden) {
        stopPolling();
      } else {
        tick();
        startPolling();
      }
    };

    startPolling();
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      stopPolling();
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [tick, intervalMs]);
}
