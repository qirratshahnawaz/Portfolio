import { defineQuery } from "next-sanity";
import { sanityFetch } from "@/sanity/lib/live";
import { AboutSectionClient } from "./AboutSectionClient";

const ABOUT_QUERY = defineQuery(`*[_id == "singleton-profile"][0]{
  firstName,
  lastName,
  fullBio,
  yearsOfExperience,
  stats,
  email,
  phone,
  location
}`);

export async function AboutSection() {
  const { data: profile } = await sanityFetch({ query: ABOUT_QUERY });

  if (!profile) {
    return null;
  }

  return <AboutSectionClient profile={profile} />;
}
