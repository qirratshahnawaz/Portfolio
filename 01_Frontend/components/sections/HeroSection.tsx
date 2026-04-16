import { defineQuery } from "next-sanity";
import { sanityFetch } from "@/sanity/lib/live";
import dynamic from "next/dynamic";

// Lazy-load HeroSectionClient to remove framer-motion + BackgroundPaths
// from the initial compilation graph — major win on slow drives.
const HeroSectionClient = dynamic(
  () => import("./HeroSectionClient").then((m) => m.HeroSectionClient),
  {
    ssr: true,
    loading: () => <div className="min-h-screen" />,
  }
);

const HERO_QUERY = defineQuery(`*[_id == "singleton-profile"][0]{
  firstName,
  lastName,
  headline,
  headlineStaticText,
  headlineAnimatedWords,
  headlineAnimationDuration,
  shortBio,
  email,
  phone,
  location,
  availability,
  socialLinks,
  yearsOfExperience,
  profileImage
}`);

export async function HeroSection() {
  const { data: profile } = await sanityFetch({ query: HERO_QUERY });

  if (!profile) {
    return null;
  }

  return <HeroSectionClient profile={profile} />;
}
