"use client";

import Image from "next/image";
import { motion, type Variants } from "framer-motion";
import {
  CalendarDaysIcon,
  ChevronDownIcon,
  ClockIcon,
  MapPinIcon,
  TicketIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { ParticlesBackground } from "@/components/landing/particles-background";
import heroImage from "@/public/hero.png";

const infoItems = [
  { icon: CalendarDaysIcon, label: "01/07 · Quarta-feira" },
  { icon: ClockIcon, label: "19:30h" },
  { icon: MapPinIcon, label: "Teatro Municipal de Anápolis" },
];

const container: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.14, delayChildren: 0.35 },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 28, filter: "blur(10px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] },
  },
};

export function HeroSection() {
  return (
    <section className="relative flex min-h-svh flex-col items-center justify-end overflow-hidden px-4 pt-24 pb-20 text-center">
      {/* Pôster da banda como fundo, com zoom lento de abertura */}
      <motion.div
        aria-hidden
        className="absolute inset-0"
        initial={{ scale: 1.12, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          opacity: { duration: 1.6, ease: "easeOut" },
          scale: { duration: 14, ease: [0.16, 1, 0.3, 1] },
        }}
      >
        <Image
          src={heroImage}
          alt=""
          fill
          priority
          placeholder="blur"
          sizes="100vw"
          className="object-cover object-[50%_30%]"
        />
      </motion.div>

      {/* Overlays: topo livre para a arte; base escura para o conteúdo */}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/35 to-background"
      />
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-black/85 via-black/45 to-transparent"
      />
      {/* Brilho dourado suave atrás do conteúdo */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 55% 30% at 50% 78%, color-mix(in oklch, var(--primary) 10%, transparent), transparent 70%)",
        }}
      />

      <ParticlesBackground />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 flex max-w-3xl flex-col items-center gap-6"
      >
        <motion.span
          variants={item}
          className="border-primary/40 bg-black/40 text-primary inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold tracking-[0.2em] uppercase backdrop-blur-sm"
        >
          <TicketIcon className="size-3.5" />
          Entrada Franca
        </motion.span>

        <motion.h1
          variants={item}
          className="font-heading text-4xl leading-[1.12] font-bold drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)] sm:text-6xl md:text-7xl"
        >
          Show de <span className="text-gold-gradient">10 anos</span>
          <br />
          da Elevatto
        </motion.h1>

        <motion.p
          variants={item}
          className="text-foreground/85 max-w-xl text-balance text-lg drop-shadow-[0_1px_8px_rgba(0,0,0,0.9)] sm:text-xl"
        >
          Uma década de música, entrega e conexão.
        </motion.p>

        <motion.div
          variants={item}
          className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm"
        >
          {infoItems.map((info) => (
            <span
              key={info.label}
              className="text-foreground/90 inline-flex items-center gap-1.5 rounded-full bg-black/35 px-3 py-1 backdrop-blur-sm"
            >
              <info.icon className="text-primary size-4" />
              {info.label}
            </span>
          ))}
        </motion.div>

        <motion.div
          variants={item}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          <Button
            size="lg"
            nativeButton={false}
            className="glow-gold-pulse h-13 px-9 text-base font-semibold"
            render={<a href="#inscricao" />}
          >
            Garanta sua inscrição gratuita
          </Button>
        </motion.div>
      </motion.div>

      {/* Indicador de rolagem */}
      <motion.a
        href="#inscricao"
        aria-label="Rolar para a inscrição"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8, duration: 0.8 }}
        className="text-primary/70 hover:text-primary absolute bottom-6 left-1/2 z-10 -translate-x-1/2 transition-colors"
      >
        <motion.span
          aria-hidden
          className="block"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDownIcon className="size-6" />
        </motion.span>
      </motion.a>
    </section>
  );
}
