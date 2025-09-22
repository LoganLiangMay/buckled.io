import React from 'react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import HeroSection from '../components/landing/HeroSection';
import WhyUsSection from '../components/landing/WhyUsSection';
import FounderSection from '../components/landing/FounderSection';
import FeaturesSection from '../components/landing/FeaturesSection';
import FAQSection from '../components/landing/FAQSection';
import CTASection from '../components/landing/CTASection';
import AITestButton from '../components/AITestButton';

const LandingPage: React.FC = () => {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <WhyUsSection />
        <FounderSection />
        <FeaturesSection />
        <FAQSection />
        <CTASection />
      </main>
      <Footer />
      <AITestButton />
    </>
  );
};

export default LandingPage;