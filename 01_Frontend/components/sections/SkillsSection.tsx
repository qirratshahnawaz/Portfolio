import { defineQuery } from "next-sanity";
import { sanityFetch } from "@/sanity/lib/live";
import dynamic from "next/dynamic";

// Lazy-load SkillsChart to remove recharts + framer-motion from the
// initial page compilation — both are large libraries with deep import trees.
const SkillsChart = dynamic(
  () => import("./SkillsChart").then((m) => m.SkillsChart),
  {
    loading: () => <div className="min-h-[400px]" />,
  }
);

const SKILLS_QUERY =
  defineQuery(`*[_type == "skill"] | order(category asc, order asc){
  name,
  category,
  proficiency,
  percentage,
  yearsOfExperience,
  color
}`);

export async function SkillsSection() {
  const { data: skills } = await sanityFetch({ query: SKILLS_QUERY });

  if (!skills || skills.length === 0) {
    return null;
  }

  return (
    <section id="skills" className="py-20 px-6 bg-transparent">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Skills & Expertise
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A comprehensive overview of my technical proficiencies and tools I
            work with daily
          </p>
        </div>

        <SkillsChart skills={skills} />
      </div>
    </section>
  );
}
