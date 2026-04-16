import { createClient } from "next-sanity";

import { apiVersion, dataset, projectId } from "../env";

export const serverClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: process.env.NODE_ENV === "production",
  token: process.env.SANITY_SERVER_WRITE_API_TOKEN,
});
