'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'

// Small blurred placeholder - teal/green tone matching the hostel theme
const blurDataURL = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjQ4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiMwQTQ4NDMiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiMxNTZkNjUiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMzIwIiBoZWlnaHQ9IjQ4MCIgZmlsbD0idXJsKCNnKSIvPjwvc3ZnPg=='

// 10 images positioned closer to center, more visible
// showOnMobile: true for the 4 images to display on small screens
const images = [
  // Left side - moved inward
  { src: '/assets/images/mandioca-0001.webp', alt: 'Hostel entrance', x: 8, y: 22, size: 'lg', rotation: -6, priority: true, showOnMobile: true },
  { src: '/assets/images/mandioca-0002.webp', alt: 'Pool area', x: 12, y: 55, size: 'xl', rotation: 4, priority: true, showOnMobile: false },
  { src: '/assets/images/mandioca-0009.webp', alt: 'Living space', x: 6, y: 82, size: 'lg', rotation: -3, priority: false, showOnMobile: false },

  // Right side - moved inward
  { src: '/assets/images/mandioca-0004.webp', alt: 'Garden view', x: 88, y: 18, size: 'xl', rotation: 5, priority: true, showOnMobile: true },
  { src: '/assets/images/mandioca-0013.webp', alt: 'Private room', x: 92, y: 52, size: 'lg', rotation: -4, priority: true, showOnMobile: false },
  { src: '/assets/images/mandioca-0005.webp', alt: 'Exterior', x: 86, y: 80, size: 'lg', rotation: 6, priority: false, showOnMobile: false },

  // Inner images - closer to text area (bottom corners on mobile)
  { src: '/assets/images/mandioca-0003.webp', alt: 'Common area', x: 25, y: 32, size: 'md', rotation: 8, priority: true, showOnMobile: false },
  { src: '/assets/images/mandioca-0011.webp', alt: 'Dorm room', x: 75, y: 30, size: 'md', rotation: -7, priority: true, showOnMobile: false },
  { src: '/assets/images/mandioca-0006.webp', alt: 'Hostel view', x: 28, y: 72, size: 'md', rotation: -5, priority: false, showOnMobile: true },
  { src: '/assets/images/mandioca-0010.webp', alt: 'Lounge', x: 72, y: 74, size: 'md', rotation: 6, priority: false, showOnMobile: true },
]

// Size classes - much smaller on mobile (< md)
const sizeClasses = {
  sm: 'w-16 md:w-40 lg:w-48',
  md: 'w-20 md:w-52 lg:w-60',
  lg: 'w-24 md:w-60 lg:w-72',
  xl: 'w-28 md:w-72 lg:w-80',
}

// Different parallax intensities
const parallaxFactors = [0.02, 0.035, 0.025, 0.04, 0.03, 0.045, 0.022, 0.038, 0.028, 0.032]

export function FloatingImages() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 })
  const animationRef = useRef<number | null>(null)
  const targetOffset = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.matchMedia('(max-width: 768px)').matches)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    if (isMobile) return

    const handleMouseMove = (e: MouseEvent) => {
      const centerX = window.innerWidth / 2
      const centerY = window.innerHeight / 2
      targetOffset.current = {
        x: (e.clientX - centerX) / centerX,
        y: (e.clientY - centerY) / centerY,
      }
    }

    const animate = () => {
      setMouseOffset((prev) => ({
        x: prev.x + (targetOffset.current.x - prev.x) * 0.025,
        y: prev.y + (targetOffset.current.y - prev.y) * 0.025,
      }))
      animationRef.current = requestAnimationFrame(animate)
    }

    window.addEventListener('mousemove', handleMouseMove)
    animationRef.current = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
    }
  }, [isMobile])

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none overflow-hidden"
      aria-hidden="true"
    >
      {images.map((img, i) => {
        // On mobile, only show images marked with showOnMobile
        if (isMobile && !img.showOnMobile) return null

        const offsetX = isMobile ? 0 : mouseOffset.x * parallaxFactors[i] * 500
        const offsetY = isMobile ? 0 : mouseOffset.y * parallaxFactors[i] * 500

        return (
          <div
            key={img.src}
            className={`absolute ${sizeClasses[img.size as keyof typeof sizeClasses]}`}
            style={{
              left: `${img.x}%`,
              top: `${img.y}%`,
              transform: `translate(-50%, -50%) translate(${offsetX}px, ${offsetY}px) rotate(${img.rotation}deg)`,
              transition: isMobile ? 'none' : 'transform 0.4s cubic-bezier(0.33, 1, 0.68, 1)',
            }}
          >
            <div
              className={`rounded-2xl overflow-hidden shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] ring-1 ring-white/20 ${
                isMobile ? 'animate-float' : ''
              }`}
              style={
                isMobile
                  ? {
                      animationDelay: `${i * 0.3}s`,
                      animationDuration: `${4 + i * 0.4}s`,
                    }
                  : undefined
              }
            >
              <Image
                src={img.src}
                alt={img.alt}
                width={320}
                height={480}
                className="w-full h-auto object-cover aspect-[2/3] brightness-105"
                priority={img.priority}
                placeholder="blur"
                blurDataURL={blurDataURL}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
