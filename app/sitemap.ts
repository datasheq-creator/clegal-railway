import type { MetadataRoute } from "next";
import { baseUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

export default function sitemap(): MetadataRoute.Sitemap {
  const site = baseUrl();
  const languages = { "es-CL": `${site}/`, en: `${site}/en` };
  return [
    { url: `${site}/`, changeFrequency: "monthly", priority: 1, alternates: { languages } },
    { url: `${site}/en`, changeFrequency: "monthly", priority: 0.8, alternates: { languages } },
  ];
}
