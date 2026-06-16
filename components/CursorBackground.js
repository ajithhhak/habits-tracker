import { useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

export default function CursorBackground() {
  const [mounted, setMounted] = useState(false)
  const cursorX = useMotionValue(-100)
  const cursorY = useMotionValue(-100)

  const springConfig = { damping: 25, stiffness: 120 }
  const x = useSpring(cursorX, springConfig)
  const y = useSpring(cursorY, springConfig)

  useEffect(() => {
    setMounted(true)
    const moveCursor = (e) => {
      cursorX.set(e.clientX)
      cursorY.set(e.clientY)
    }
    window.addEventListener('mousemove', moveCursor)
    return () => window.removeEventListener('mousemove', moveCursor)
  }, [cursorX, cursorY])

  if (!mounted) return null

  return (
    <>
      <motion.div
        style={{ x, y, translateX: '-50%', translateY: '-50%' }}
        className="fixed top-0 left-0 w-[600px] h-[600px] bg-brand-400/20 dark:bg-brand-500/20 rounded-full blur-[100px] pointer-events-none z-0 mix-blend-screen"
      />
      <motion.div
        style={{ x: useSpring(cursorX, { damping: 40, stiffness: 80 }), y: useSpring(cursorY, { damping: 40, stiffness: 80 }), translateX: '-30%', translateY: '-70%' }}
        className="fixed top-0 left-0 w-[400px] h-[400px] bg-blue-400/20 dark:bg-indigo-500/20 rounded-full blur-[80px] pointer-events-none z-0 mix-blend-screen"
      />
    </>
  )
}
