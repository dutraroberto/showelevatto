"use client";

import { motion } from "framer-motion";
import { HeartHandshakeIcon, SparklesIcon, UsersRoundIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

const cards = [
  {
    icon: SparklesIcon,
    title: "10 anos de história",
    text: "Uma noite para celebrar uma década de música, entrega e momentos que marcaram a trajetória da Elevatto.",
  },
  {
    icon: HeartHandshakeIcon,
    title: "Entrada 100% gratuita",
    text: "Não há nenhum custo para participar. Basta garantir a sua inscrição para assegurar o seu lugar.",
  },
  {
    icon: UsersRoundIcon,
    title: "Vagas limitadas",
    text: "O teatro tem capacidade limitada. As inscrições são por ordem de chegada, até esgotar os ingressos.",
  },
];

export function EventInfo() {
  return (
    <section className="relative px-4 pt-20 pb-12">
      <div className="mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mb-12 text-center"
        >
          <h2 className="font-heading text-3xl font-bold sm:text-4xl">
            Uma celebração à{" "}
            <span className="text-gold-gradient">altura da Elevatto</span>
          </h2>
          <p className="text-muted-foreground mx-auto mt-3 max-w-xl text-balance">
            Reserve sua presença para essa noite especial. A entrada é franca,
            mas o número de ingressos é limitado.
          </p>
        </motion.div>

        <div className="grid gap-5 sm:grid-cols-3">
          {cards.map((card, i) => (
            <motion.div
              key={card.title}
              custom={i}
              initial="hidden"
              whileInView="show"
              whileHover="hover"
              viewport={{ once: true, margin: "-60px" }}
              variants={{
                hidden: { opacity: 0, y: 24, filter: "blur(8px)" },
                show: (index: number) => ({
                  opacity: 1,
                  y: 0,
                  filter: "blur(0px)",
                  transition: { duration: 0.6, delay: index * 0.15 },
                }),
                hover: {
                  y: -6,
                  transition: { type: "spring", stiffness: 350, damping: 22 },
                },
              }}
              className="group"
            >
              <Card className="border-primary/15 bg-card/60 relative h-full overflow-hidden backdrop-blur transition-[border-color,box-shadow] duration-300 hover:border-primary/40 hover:shadow-[0_12px_40px_-12px_color-mix(in_oklch,var(--primary)_35%,transparent)]">
                {/* Brilho que varre o card no hover */}
                <span
                  aria-hidden
                  className="via-primary/10 pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full"
                />
                <CardContent className="flex flex-col gap-3">
                  <span className="bg-primary/10 text-primary ring-primary/20 flex size-11 items-center justify-center rounded-xl ring-1 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                    <card.icon className="size-5" />
                  </span>
                  <h3 className="text-lg font-semibold">{card.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {card.text}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
