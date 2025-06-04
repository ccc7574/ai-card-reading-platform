import { useEffect, useRef } from 'react'

interface SwipeGestureOptions {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
  threshold?: number
}

export function useSwipeGesture(options: SwipeGestureOptions) {
  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    threshold = 50
  } = options

  const touchStartRef = useRef<{ x: number; y: number } | null>(null)
  const elementRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0]
      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY
      }
    }

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStartRef.current) return

      const touch = e.changedTouches[0]
      const deltaX = touch.clientX - touchStartRef.current.x
      const deltaY = touch.clientY - touchStartRef.current.y

      const absDeltaX = Math.abs(deltaX)
      const absDeltaY = Math.abs(deltaY)

      // 确保滑动距离超过阈值
      if (Math.max(absDeltaX, absDeltaY) < threshold) {
        touchStartRef.current = null
        return
      }

      // 判断滑动方向
      if (absDeltaX > absDeltaY) {
        // 水平滑动
        if (deltaX > 0 && onSwipeRight) {
          onSwipeRight()
        } else if (deltaX < 0 && onSwipeLeft) {
          onSwipeLeft()
        }
      } else {
        // 垂直滑动
        if (deltaY > 0 && onSwipeDown) {
          onSwipeDown()
        } else if (deltaY < 0 && onSwipeUp) {
          onSwipeUp()
        }
      }

      touchStartRef.current = null
    }

    element.addEventListener('touchstart', handleTouchStart, { passive: true })
    element.addEventListener('touchend', handleTouchEnd, { passive: true })

    return () => {
      element.removeEventListener('touchstart', handleTouchStart)
      element.removeEventListener('touchend', handleTouchEnd)
    }
  }, [onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, threshold])

  return elementRef
}

// 移动端检测Hook
export function useIsMobile() {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

  return isMobile
}

// 触摸反馈Hook
export function useTouchFeedback() {
  const addTouchFeedback = (element: HTMLElement) => {
    const handleTouchStart = () => {
      element.style.transform = 'scale(0.98)'
      element.style.transition = 'transform 0.1s ease'
    }

    const handleTouchEnd = () => {
      element.style.transform = 'scale(1)'
    }

    element.addEventListener('touchstart', handleTouchStart, { passive: true })
    element.addEventListener('touchend', handleTouchEnd, { passive: true })
    element.addEventListener('touchcancel', handleTouchEnd, { passive: true })

    return () => {
      element.removeEventListener('touchstart', handleTouchStart)
      element.removeEventListener('touchend', handleTouchEnd)
      element.removeEventListener('touchcancel', handleTouchEnd)
    }
  }

  return addTouchFeedback
}
