import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

const CONFETTI_COLORS = [
  '#f5b82e', // Gold
  '#ffffff', // White
  '#3b82f6', // Azure Blue
  '#10b981', // Emerald Green
  '#f43f5e', // Rose Red
  '#a855f7', // Purple
];

const Confetti = ({ count = 35 }) => {
  const particles = useMemo(() => {
    return Array.from({ length: count }).map((_, i) => {
      const color = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
      const size = Math.random() * 8 + 4; // 4px to 12px
      const left = Math.random() * 100; // 0% to 100%
      const duration = Math.random() * 4 + 4; // 4s to 8s
      const delay = Math.random() * 5; // 0s to 5s
      const rotate = Math.random() * 360;
      const isCircle = Math.random() > 0.5;

      return {
        id: i,
        color,
        size,
        left,
        duration,
        delay,
        rotate,
        isCircle
      };
    });
  }, [count]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{
            y: '-10%',
            x: 0,
            opacity: 0,
            rotate: p.rotate
          }}
          animate={{
            y: ['0%', '115vh'],
            x: [0, Math.sin(p.id) * 40, -Math.sin(p.id) * 30, 0],
            opacity: [0, 1, 0.8, 0],
            rotate: [p.rotate, p.rotate + 360 * (p.id % 2 === 0 ? 1 : -1)]
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: 'linear'
          }}
          style={{
            position: 'absolute',
            left: `${p.left}%`,
            width: `${p.size}px`,
            height: `${p.isCircle ? p.size : p.size * 1.6}px`,
            backgroundColor: p.color,
            borderRadius: p.isCircle ? '50%' : '2px',
            boxShadow: `0 0 6px ${p.color}80`
          }}
        />
      ))}
    </div>
  );
};

export default Confetti;
