"use client";

import { motion } from "framer-motion";

const ease = [0.22, 1, 0.36, 1] as const;

// Divisor ornamental dourado entre seções: linhas que se desenham a partir
// do losango central, no espírito art-deco do restante da página.
export function SectionDivider() {
  return (
    <div
      aria-hidden
      className="relative flex items-center justify-center gap-3 px-8"
    >
      <motion.span
        className="from-primary/60 h-px w-full max-w-44 origin-right bg-gradient-to-l to-transparent"
        initial={{ scaleX: 0, opacity: 0 }}
        whileInView={{ scaleX: 1, opacity: 1 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 1, ease, delay: 0.2 }}
      />

      <motion.span
        className="relative block shrink-0"
        initial={{ rotate: -135, scale: 0, opacity: 0 }}
        whileInView={{ rotate: 0, scale: 1, opacity: 1 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ type: "spring", stiffness: 200, damping: 18 }}
      >
        <span className="border-primary/70 bg-primary/15 block size-2.5 rotate-45 border" />
        {/* Halo pulsante atrás do losango */}
        <motion.span
          className="bg-primary/40 absolute inset-0 rotate-45 blur-[6px]"
          animate={{ opacity: [0.3, 0.9, 0.3], scale: [1, 1.6, 1] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.span>

      <motion.span
        className="from-primary/60 h-px w-full max-w-44 origin-left bg-gradient-to-r to-transparent"
        initial={{ scaleX: 0, opacity: 0 }}
        whileInView={{ scaleX: 1, opacity: 1 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 1, ease, delay: 0.2 }}
      />
    </div>
  );
}
