"use client"

import { useCallback, useRef } from "react"

// Debounce hook for search and input optimization
export function useDebounce<T extends (...args: any[]) => any>(callback: T, delay: number): T {
  const timeoutRef = useRef<NodeJS.Timeout>()

  return useCallback(
    ((...args: Parameters<T>) => {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(() => callback(...args), delay)
    }) as T,
    [callback, delay],
  )
}

// Throttle hook for scroll and resize events
export function useThrottle<T extends (...args: any[]) => any>(callback: T, delay: number): T {
  const lastRun = useRef(Date.now())

  return useCallback(
    ((...args: Parameters<T>) => {
      if (Date.now() - lastRun.current >= delay) {
        callback(...args)
        lastRun.current = Date.now()
      }
    }) as T,
    [callback, delay],
  )
}

// Local storage with error handling
export const safeLocalStorage = {
  getItem: (key: string): string | null => {
    try {
      return localStorage.getItem(key)
    } catch {
      return null
    }
  },
  setItem: (key: string, value: string): void => {
    try {
      localStorage.setItem(key, value)
    } catch {
      // Silently fail
    }
  },
  removeItem: (key: string): void => {
    try {
      localStorage.removeItem(key)
    } catch {
      // Silently fail
    }
  },
}

// Image optimization utility
export const optimizeImage = (url: string, width?: number, height?: number): string => {
  if (!url) return ""

  // If it's a placeholder image, add optimization parameters
  if (url.includes("placeholder.svg")) {
    const params = new URLSearchParams()
    if (width) params.set("width", width.toString())
    if (height) params.set("height", height.toString())
    return `${url}&${params.toString()}`
  }

  return url
}
