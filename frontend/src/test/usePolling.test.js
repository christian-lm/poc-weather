import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import usePolling from '../hooks/usePolling';

describe('usePolling', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('calls callback immediately on mount', () => {
    const callback = vi.fn();
    renderHook(() => usePolling(callback, 100));
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('calls callback on interval', () => {
    const callback = vi.fn();
    renderHook(() => usePolling(callback, 100));
    act(() => {
      vi.advanceTimersByTime(250);
    });
    expect(callback.mock.calls.length).toBeGreaterThan(1);
  });

  it('cleans up interval on unmount', () => {
    const callback = vi.fn();
    const { unmount } = renderHook(() => usePolling(callback, 100));
    const callsAfterMount = callback.mock.calls.length;
    unmount();
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(callback.mock.calls.length).toBe(callsAfterMount);
  });
});
