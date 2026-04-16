import { defineQuery } from "next-sanity";
import Chat from "./Chat";
import { sanityFetch } from "@/sanity/lib/live";
import SidebarToggle from "../SidebarToggle";

const CHAT_PROFILE_QUERY = defineQuery(`*[_id == "singleton-profile"][0]{
    _id,
    _type,
    _createdAt,
    _updatedAt,
    _rev,
    firstName,
    lastName,
    headline,
    shortBio,
    email,
    phone,
    location,
    availability,
    socialLinks,
    yearsOfExperience,
    profileImage
  }`);

async function ChatWrapper() {
  const { data: profile } = await sanityFetch({ query: CHAT_PROFILE_QUERY });

  return (
    <div className="flex flex-col h-screen w-full bg-background overflow-hidden">
      <div className="md:hidden p-3 border-b bg-background/50 backdrop-blur-md flex items-center justify-between">
        <SidebarToggle />
        <span className="text-[10px] font-bold tracking-widest uppercase opacity-40">
          AI Twin Interface
        </span>
      </div>

      <div className="flex-1 w-full min-h-0 overflow-hidden flex flex-col">
        <Chat profile={profile} />
      </div>
    </div>
  );
}

export default ChatWrapper;
