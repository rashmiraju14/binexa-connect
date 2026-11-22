import { resources } from "./content";
import { articleSections } from "./articles";

// The Resources Library defines the reading order. Only complete published guides qualify.
export function nextResource(slug: string) {
  const guides = resources.filter(resource => articleSections[resource.slug]);
  const index = guides.findIndex(resource => resource.slug === slug);
  return index < 0 ? undefined : guides[index + 1];
}
