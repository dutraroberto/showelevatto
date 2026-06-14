import Image from "next/image";

import { HeroSection } from "@/components/landing/hero-section";
import { EventInfo } from "@/components/landing/event-info";
import { RegistrationSection } from "@/components/landing/registration-section";
import { SectionDivider } from "@/components/landing/section-divider";
import rodapeImage from "@/public/rodape.png";
import logoFooter from "@/public/logo-footer.png";
import bannerImage from "@/public/banner-elevatto.png";

export default function HomeV2() {
  return (
    <div className="bg-elevatto flex flex-1 flex-col">
      <HeroSection image={bannerImage} />
      <EventInfo />
      <SectionDivider />
      <RegistrationSection trackPath="/v2" />

      <footer className="relative overflow-hidden px-4 pt-56 pb-12 text-center">
        {/* Multidão com brilho dourado fechando a página */}
        <Image
          src={rodapeImage}
          alt=""
          fill
          placeholder="blur"
          sizes="100vw"
          className="object-cover object-[50%_30%]"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-black/75"
        />

        <div className="relative">
          <Image
            src={logoFooter}
            alt="Elevatto"
            height={120}
            className="mx-auto drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]"
          />
          <p className="text-foreground/80 mt-2 text-xs drop-shadow-[0_1px_6px_rgba(0,0,0,0.9)]">
            Show de 10 anos · Teatro Municipal de Anápolis · 01/07 às 19:30h
          </p>
        </div>
      </footer>
    </div>
  );
}
