import { stegaClean } from "next-sanity";
import { NavigationIcon } from "@/components/header/navigation-icon";

/**
 * A section button's role comes from its place in the Studio array, never
 * from an editor choice: the first is the section's one primary action, every
 * later one is an outline. That keeps Campfire Amber to one button per group
 * (DESIGN.md, The One Fire Rule). Editors are not designers.
 */
export function sectionButtonVariant(index: number): "primary" | "outline" {
  return index === 0 ? "primary" : "outline";
}

type StoredButtonIcon = { name?: string | null; svg?: string | null } | null;

/** The icon an editor picked for a button, shown before its label. */
export function SectionButtonIcon({ icon }: { icon?: StoredButtonIcon }) {
  const name = stegaClean(icon?.name)?.trim();
  const svg = stegaClean(icon?.svg)?.trim();
  if (!name || !svg) return null;
  return <NavigationIcon icon={{ name, svg }} />;
}
