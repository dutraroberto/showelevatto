"use client";

import { motion } from "framer-motion";

// Posições fixas (determinísticas) para evitar mismatch de hidratação.
const dots = [
  { left: "8%", top: "18%", size: 3, delay: 0, duration: 6, drift: 10 },
  { left: "22%", top: "62%", size: 2, delay: 1.2, duration: 7, drift: -8 },
  { left: "35%", top: "30%", size: 4, delay: 0.6, duration: 8, drift: 14 },
  { left: "48%", top: "78%", size: 2, delay: 2, duration: 6.5, drift: -12 },
  { left: "61%", top: "22%", size: 3, delay: 0.3, duration: 7.5, drift: 8 },
  { left: "73%", top: "55%", size: 2, delay: 1.6, duration: 6, drift: -10 },
  { left: "86%", top: "34%", size: 4, delay: 0.9, duration: 8.5, drift: 12 },
  { left: "92%", top: "70%", size: 2, delay: 2.4, duration: 7, drift: -6 },
  { left: "15%", top: "85%", size: 3, delay: 1.1, duration: 6.8, drift: 9 },
  { left: "54%", top: "12%", size: 2, delay: 0.4, duration: 7.2, drift: -11 },
  { left: "30%", top: "48%", size: 2, delay: 1.9, duration: 6.3, drift: 7 },
  { left: "68%", top: "88%", size: 3, delay: 0.7, duration: 8.1, drift: -9 },
  { left: "5%", top: "45%", size: 2, delay: 2.8, duration: 7.8, drift: 11 },
  { left: "42%", top: "55%", size: 3, delay: 1.4, duration: 6.6, drift: -7 },
  { left: "79%", top: "15%", size: 2, delay: 0.2, duration: 7.4, drift: 6 },
  { left: "96%", top: "50%", size: 3, delay: 2.1, duration: 8.3, drift: -13 },
];

export function ParticlesBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {dots.map((dot, i) => (
        <motion.span
          key={i}
          className="bg-primary absolute rounded-full"
          style={{
            left: dot.left,
            top: dot.top,
            width: dot.size,
            height: dot.size,
            boxShadow:
              "0 0 8px 2px color-mix(in oklch, var(--primary) 60%, transparent)",
          }}
          initial={{ opacity: 0.1, y: 0, x: 0, scale: 1 }}
          animate={{
            opacity: [0.1, 0.8, 0.25, 0.7, 0.1],
            y: [0, -22, -10, -26, 0],
            x: [0, dot.drift, dot.drift / 2, dot.drift, 0],
            scale: [1, 1.3, 1, 1.25, 1],
          }}
          transition={{
            duration: dot.duration,
            delay: dot.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
