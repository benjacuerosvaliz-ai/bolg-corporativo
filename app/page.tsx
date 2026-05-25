import { Hero } from "@/components/marketing/Hero";
import { Pillars } from "@/components/marketing/Pillars";
import { LogoWall } from "@/components/marketing/LogoWall";
import { SuccessMetrics } from "@/components/marketing/SuccessMetrics";
import { FaqB2B } from "@/components/marketing/FaqB2B";
import { CtaFooter } from "@/components/marketing/CtaFooter";

export default function Home() {
  return (
    <>
      <Hero />
      <Pillars />
      <LogoWall />
      <SuccessMetrics />
      <FaqB2B />
      <CtaFooter />
    </>
  );
}
