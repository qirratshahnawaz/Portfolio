import { defineQuery } from "next-sanity";
import { sanityFetch } from "@/sanity/lib/live";
import { NavbarClient } from "./NavbarClient";

const NAVBAR_QUERY = defineQuery(`{
  "hasAbout": count(*[_type == "profile"]) > 0,
  "hasTestimonials": count(*[_type == "testimonial"]) > 0,
  "hasSkills": count(*[_type == "skill"]) > 0,
  "hasExperience": count(*[_type == "experience"]) > 0,
  "hasEducation": count(*[_type == "education"]) > 0,
  "hasProjects": count(*[_type == "project"]) > 0,
  "hasAchievements": count(*[_type == "achievement"]) > 0,
  "hasServices": count(*[_type == "service"]) > 0,
  "hasBlog": count(*[_type == "post"]) > 0,
  "hasCertifications": count(*[_type == "certification"]) > 0
}`);

export async function Navbar() {
  const { data } = await sanityFetch({ query: NAVBAR_QUERY });

  const navItems: { label: string; href: string }[] = [];

  // Always show Home
  navItems.push({ label: "Home", href: "#home" });

  if (data?.hasAbout) navItems.push({ label: "About", href: "#about" });
  if (data?.hasServices) navItems.push({ label: "Services", href: "#services" });
  if (data?.hasSkills) navItems.push({ label: "Skills", href: "#skills" });
  if (data?.hasExperience) navItems.push({ label: "Experience", href: "#experience" });
  if (data?.hasEducation) navItems.push({ label: "Education", href: "#education" });
  if (data?.hasProjects) navItems.push({ label: "Projects", href: "#projects" });
  if (data?.hasAchievements) navItems.push({ label: "Achievements", href: "#achievements" });
  if (data?.hasCertifications) navItems.push({ label: "Certifications", href: "#certifications" });
  if (data?.hasTestimonials) navItems.push({ label: "Testimonials", href: "#testimonials" });
  if (data?.hasBlog) navItems.push({ label: "Blog", href: "#blog" });

  // Always show Contact as the last section
  navItems.push({ label: "Contact", href: "#contact" });

  return <NavbarClient navItems={navItems} />;
}
