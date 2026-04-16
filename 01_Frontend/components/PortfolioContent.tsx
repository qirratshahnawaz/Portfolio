import {
  AboutSection,
  AchievementsSection,
  BlogSection,
  CertificationsSection,
  ContactSection,
  EducationSection,
  ExperienceSection,
  HeroSection,
  ProjectsSection,
  ServicesSection,
  SkillsSection,
  TestimonialsSection,
} from "@/components/sections";

import { Navbar } from "@/components/Navbar";

async function PortfolioContent() {
  return (
    <>
      <Navbar />
      <HeroSection />
      <AboutSection />
      <TestimonialsSection />
      <SkillsSection />
      <ExperienceSection />
      <EducationSection />
      <ProjectsSection />
      <AchievementsSection />
      <ServicesSection />
      <BlogSection />
      <CertificationsSection />
      <ContactSection />
    </>
  );
}

export default PortfolioContent;
