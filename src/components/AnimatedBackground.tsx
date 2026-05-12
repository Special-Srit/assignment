'use client'
import { motion } from 'framer-motion'

export default function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
      {/* Dot grid */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: 'radial-gradient(#d1d5db 1px, transparent 1px)',
          backgroundSize: '20px 20px',
          opacity: 0.5,
        }}
      />

      {/* Shape 1: circle top-left */}
      <motion.div
        className="absolute rounded-full"
        style={{ width: 140, height: 140, top: -40, left: -40, background: '#e5e7eb', opacity: 0.7 }}
        animate={{ y: [0, -18, 0], x: [0, 10, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Shape 2: rounded rect bottom-right */}
      <motion.div
        className="absolute"
        style={{ width: 110, height: 110, bottom: -30, right: -30, borderRadius: 18, background: '#d1d5db', opacity: 0.6 }}
        animate={{ y: [0, 14, 0], x: [0, -10, 0], rotate: [25, 32, 25] }}
        transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Shape 3: circle middle-right */}
      <motion.div
        className="absolute rounded-full"
        style={{ width: 90, height: 90, top: '40%', right: -20, background: '#f3f4f6', opacity: 0.8 }}
        animate={{ y: [0, -12, 0], x: [0, 8, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Shape 4: rounded rect middle-left */}
      <motion.div
        className="absolute"
        style={{ width: 70, height: 70, top: '60%', left: -15, borderRadius: 10, background: '#e5e7eb', opacity: 0.6 }}
        animate={{ y: [0, 16, 0], x: [0, -6, 0], rotate: [-15, -22, -15] }}
        transition={{ duration: 13, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  )
}
