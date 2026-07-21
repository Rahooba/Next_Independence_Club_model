'use client'

import HeroSection from '@/components/home/HeroSection';
import ModelsExplainerSection from '@/components/home/ModelsExplainerSection';
import ToolsSection from '@/components/home/ToolsSection';
import CtaSection from '@/components/home/CtaSection';
import FooterHome from '@/components/home/FooterHome';

const HomePage = () => {
  return (
    <div style={{ overflowX: 'hidden' }}>
      <HeroSection />
      <ModelsExplainerSection />
      <ToolsSection />
      <CtaSection />
      <FooterHome />
    </div>
  );
};

export default function Page() {
  return <HomePage />;
}
